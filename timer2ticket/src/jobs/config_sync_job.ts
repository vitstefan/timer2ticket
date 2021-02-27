import { Mapping } from "../models/mapping/mapping";
import { MappingsObject } from "../models/mapping/mappings_object";
import { ServiceDefinition } from "../models/service_definition/service_definition";
import { ServiceObject } from "../models/synced_service/service_object/service_object";
import { User } from "../models/user";
import { databaseService } from "../shared/database_service";
import { SyncedServiceCreator } from "../synced_services/synced_service_creator";
import { SyncJob } from "./sync_job";

export class ConfigSyncJob implements SyncJob {
  /**
   * This job takes mappings from the user and checks if there are any problems with them
   * If there are no mappings, job is called probably for the first time for this user
   * Should create all mappings and sync all projects, issues etc. from primary service to the other ones
   * 
   * If mappings are there, should check if all are correct and updated
   * E.g. looks for project definition in one service and checks if mapping is synced in PRIMARY (for example name could change, or project has been deleted)
   * If not, updates mappings and propagates change through other services
   * Additionally, checks if anything is missing in the secondary services and it should be there (user could delete it by mistake)
   * 
   * @param user Given user, mappings and everything should be there or this job creates them
   */
  async doTheJob(user: User): Promise<boolean> {
    const primaryServiceDefinition: ServiceDefinition | undefined
      = user.serviceDefinitions.find(serviceDefinition => serviceDefinition.isPrimary);

    if (!primaryServiceDefinition) {
      throw 'Primary service definition not found.';
    }

    const primarySyncedService = SyncedServiceCreator.create(primaryServiceDefinition);

    // Gets all objects from primary to sync with the other ones
    const objectsToSync: ServiceObject[] = await primarySyncedService.getAllServiceObjects();

    // Check primary objects and mappings, if something is wrong, fix it
    // Scenarios (based on objects from primary service):
    // a) Mapping is missing
    //    => create mapping, propagate objects to other services
    // b) Mapping is there, but is incorrect (for example project name changed)
    //    => update mapping, propagate changes to other services
    // c) Mapping is there, but object is not there (in primary service)
    //    => delete objects from other services and delete mapping
    // d) Mapping is there and is the same as primary object
    //    => do nothing
    // e) Mapping is there, but mappingObject for given service is missing
    //    => create objects in service and add mappingObject to the mapping
    // f) Mapping is there, mappingObject for given service too, but real object is missing
    //    => create object in service

    // Also, if new service was added, this job should do the right job as it is

    // array of checked mappings (new ones or existing ones), used for finding obsolete mappings
    const checkedMappings: Mapping[] = [];

    let operationsOk = true;

    // Check all objectsToSync and their corresponding mapping
    try {
      for (const objectToSync of objectsToSync) {
        let mapping = user.mappings.find(mapping => mapping.primaryObjectId === objectToSync.id);

        if (!mapping) {
          // scenario a)
          console.log('create');
          mapping = await this._createMapping(user, objectToSync);
        } else {
          console.log('check');
          // scenario b), d), e), f)
          operationsOk &&= await this._checkMapping(user, objectToSync, mapping);
        }

        // push to checkedMappings
        // can be undefined from scenario a)
        checkedMappings.push(mapping);
      }
    } catch (ex) {
      // TODO catch specific exception
      console.log(ex);
      operationsOk = false;
    }

    // obsolete mappings = user's mappings that were not checked => there is no primary object linked to it
    const obsoleteMappings =
      user
        .mappings
        .filter(
          mapping => checkedMappings.find(checkedMapping => checkedMapping === mapping)
            === undefined);

    if (obsoleteMappings.length > 0) {
      for (const mapping of obsoleteMappings) {
        // scenario c)
        operationsOk &&= await this._deleteMapping(user, mapping);
      }

      // and remove all obsolete mappings from user's mappings
      user.mappings
        = user
          .mappings
          .filter(
            mapping => obsoleteMappings.find(obsoleteMapping => obsoleteMapping === mapping)
              === undefined);
    }

    // persist changes in the mappings
    if (operationsOk) {
      // only if all api operations were ok, persist changes
      await databaseService.updateUser(user);
    }

    return operationsOk;
  }

  /**
   * Creates mapping based on objectToSync
   * @param user
   * @param objectToSync object from primary service
   */
  private async _createMapping(user: User, objectToSync: ServiceObject): Promise<Mapping> {
    // is wrapped in try catch block above
    const mapping = new Mapping();
    mapping.primaryObjectId = objectToSync.id;
    mapping.name = objectToSync.name;

    // for each service, create mappingsObject
    for (const serviceDefinition of user.serviceDefinitions) {
      const syncedService = SyncedServiceCreator.create(serviceDefinition);

      let mappingsObject;
      if (serviceDefinition.isPrimary) {
        // do not create real object in the service, it is already there, just create new serviceObject
        mappingsObject = new MappingsObject(objectToSync.id, objectToSync.name, serviceDefinition.name, objectToSync.type);
      } else {
        // firstly create object in the service, then create serviceObject with newly acquired id
        const createdObject = await syncedService.createServiceObject(objectToSync.id, objectToSync.name, objectToSync.type);
        console.log(`Created object ${createdObject.name}`);
        mappingsObject = new MappingsObject(createdObject.id, createdObject.name, serviceDefinition.name, createdObject.type);
      }

      mapping.mappingsObjects.push(mappingsObject);
      console.log(`Pushed serviceObject ${mappingsObject.type}`);
    }

    user.mappings.push(mapping);
    console.log(`Pushed mapping ${mapping.name}`);

    return mapping;
  }

  private async _checkMapping(user: User, objectToSync: ServiceObject, mapping: Mapping): Promise<boolean> {
    // TODO consider branching Project/AdditionalObject, is it useful? Why not only universal object
    // branching would be done in redmine_synced_service, where it would call different api methods to the service
    // and creation would differ based on that, it should be ok without these horrible if type !== project...

    // is wrapped in try catch block above
    mapping.name = objectToSync.name;
    for (const serviceDefinition of user.serviceDefinitions) {
      if (serviceDefinition.isPrimary) continue;

      const syncedService = SyncedServiceCreator.create(serviceDefinition);

      const mappingsObject = mapping.mappingsObjects.find(mappingObject => mappingObject.service === serviceDefinition.name);

      if (!mappingsObject) {
        // scenario e)
        // mappingObject is missing, create a new one and add to mapping (maybe new service was added)
        // create a real object in the service and add mappingObject
        // firstly create object in the service, then create serviceObject with newly acquired id
        const newObject = await syncedService.createServiceObject(objectToSync.id, objectToSync.name, objectToSync.type);
        console.log(`Created object ${newObject.name}`);
        const newMappingsObject = new MappingsObject(newObject.id, newObject.name, serviceDefinition.name, newObject.type);
        mapping.mappingsObjects.push(newMappingsObject);
      } else {
        // scenario b), d), f)
        // check if mapping corresponds with real object in the service
        const objectBasedOnMapping = await syncedService.getServiceObject(mappingsObject.id, mappingsObject.type);
        if (!objectBasedOnMapping) {
          // scenario f), create new object in the service
          const newObject = await syncedService.createServiceObject(objectToSync.id, objectToSync.name, objectToSync.type);
          console.log(`Created object ${newObject.name}`);
          mappingsObject.id = newObject.id;
          mappingsObject.lastUpdated = Date.now();
        } else if (objectBasedOnMapping.name !== mappingsObject.name) {
          // scenario b)
          // name is incorrect => maybe mapping was outdated or/and real object was outdated
          await syncedService.updateServiceObject(
            new ServiceObject(mappingsObject.id, mapping.name, mappingsObject.type)
          );
          console.log(`Updated object ${mapping.name}`);
          mappingsObject.lastUpdated = Date.now();
        } else {
          // scenario d)
          // everything OK, do nothing
        }
      }
    }

    return true;
  }

  private async _deleteMapping(user: User, mapping: Mapping): Promise<boolean> {
    let operationsOk = true;

    for (const mappingObject of mapping.mappingsObjects) {
      const serviceDefinition = user.serviceDefinitions.find(serviceDefinition => serviceDefinition.name === mappingObject.service);

      // if serviceDefinition not found or isPrimary => means do not delete project from primary service since it is not there
      if (!serviceDefinition || serviceDefinition.isPrimary) continue;

      const syncedService = SyncedServiceCreator.create(serviceDefinition);
      operationsOk &&= await syncedService.deleteServiceObject(mappingObject.id, mappingObject.type);
      console.log(`Deleted object ${mapping.name}`);
    }

    // if any of those operations did fail, return false
    return operationsOk;
  }
}