import { ServiceDefinition } from "../models/service_definition/service_definition";
import { TimeEntry } from "../models/synced_service/time_entry/time_entry";
import { User } from "../models/user";
import { Utilities } from "../shared/utilities";
import { SyncedServiceCreator } from "../synced_services/synced_service_creator";
import { SyncJob } from "./sync_job";
import { databaseService } from '../shared/database_service';
import { TimeEntrySyncedObject } from "../models/synced_service/time_entry_synced_object/time_entry_synced_object";
import { ServiceTimeEntryObject } from "../models/synced_service/time_entry_synced_object/service_time_entry_object";
import { SyncedService } from "../synced_services/synced_service";
import { ServiceObject } from "../models/synced_service/service_object/service_object";
import { TimeEntryManagerCreator } from "../synced_services/time_entry_manager_creator";

export class TimeEntriesSyncJob implements SyncJob {
  /**
   * This job takes all unsynced time entries from services and synces them across all other services
   * Synces time entries, that are identified with the user's mappings
   * 
   * @param user Given user, mappings should be there
   */
  async doTheJob(user: User): Promise<boolean> {
    let now = new Date();
    const twoWeeksAgo = new Date(now.setDate(now.getDate() - 14));
    now = new Date();
    // TODO uncomment if not testing
    // const start = Utilities.compare(user.registrated, twoWeeksAgo) > 0
    //   ? user.registrated
    //   : twoWeeksAgo;
    const start = Utilities.compare(user.registrated, twoWeeksAgo) < 0
      ? user.registrated
      : twoWeeksAgo;

    // Need to load all time entries (TE) for each service
    // Try to find time entry in timeEntrySyncedObjects (TESOs) from DB
    // Scenarios:
    // a) TESO for given TE is not there
    //    => sync to all other services and then create new TESO
    // b) TESO is there for all services (all serviceTimeEntryObjects (STEOs) are in the TESO)
    //    => check if in any of those services does not contain updated TE (take the most recent)
    //    => if yes, then update in all other services and update TESO's lastUpdated
    //    => if no, it is synced - do nothing
    // c) TESO is there, but for some services is missing (STEOs are incomplete)
    //    => check if not somewhere updated like b), then update, otherwise do not
    //    => then sync with missing services and create new STEOs for TESO and update TESO's lastUpdated
    // object wrapper for service and its timeEntries
    const serviceTimeEntriesWrappers: ServiceTimeEntriesWrapper[] = [];

    // for each service definition, request time entries and then for each other service definition, sync them
    for (const serviceDefinition of user.serviceDefinitions) {
      const syncedService = SyncedServiceCreator.create(serviceDefinition);
      // const timeEntries = await syncedService.getTimeEntries(start, now);
      // console.log(`\n${serviceDefinition.name} *********************************\n`);
      // console.log(timeEntries);
      serviceTimeEntriesWrappers.push(new ServiceTimeEntriesWrapper(
        serviceDefinition,
        syncedService,
        await syncedService.getTimeEntries(start, now),
      ));
    }

    // console.log(serviceTimeEntries);

    const timeEntrySyncedObjects = await databaseService.getTimeEntrySyncedObjects(user);

    for (const serviceTimeEntriesWrapper of serviceTimeEntriesWrappers) {
      for (const timeEntry of serviceTimeEntriesWrapper.timeEntries) {
        const timeEntrySyncedObject = timeEntrySyncedObjects?.find((teso: TimeEntrySyncedObject) =>
          teso.serviceTimeEntryObjects
            .find((steo: ServiceTimeEntryObject) =>
              steo.service === serviceTimeEntriesWrapper.serviceDefinition.name
              && steo.id === timeEntry.id));

        if (timeEntrySyncedObject) {
          // scenario b) or c)
          console.log('b) or c)');
        } else {
          // scenario a)
          console.log('a)');
          await this._createTimeEntrySyncedObject(user, serviceTimeEntriesWrapper, serviceTimeEntriesWrappers, timeEntry);
        }
      }
    }

    return true;
  }

  private async _createTimeEntrySyncedObject(
    user: User,
    timeEntryOriginServiceWrapper: ServiceTimeEntriesWrapper,
    serviceTimeEntriesWrappers: ServiceTimeEntriesWrapper[],
    timeEntry: TimeEntry)
    : Promise<TimeEntrySyncedObject | null> {
    const newTimeEntrySyncedObjectResult = new TimeEntrySyncedObject(user._id);

    const otherServiceTimeEntriesWrappers = serviceTimeEntriesWrappers
      .filter(stew => stew.serviceDefinition.name !== timeEntryOriginServiceWrapper.serviceDefinition.name);

    const otherServicesMappingsObjects = TimeEntryManagerCreator.create(timeEntryOriginServiceWrapper.serviceDefinition).getOtherMappingsObjects(timeEntry, user.mappings);

    for (const otherServiceDefinition of otherServiceTimeEntriesWrappers) {
      const otherServiceMappingsObjects = otherServicesMappingsObjects.filter(mappingsObject => mappingsObject.service === otherServiceDefinition.serviceDefinition.name);

      const serviceObjectsMappings: ServiceObject[] = [];
      for (const otherServiceMappingsObject of otherServiceMappingsObjects) {
        serviceObjectsMappings.push(new ServiceObject(
          otherServiceMappingsObject.id,
          otherServiceMappingsObject.name,
          otherServiceMappingsObject.type,
        ));
      }

      // TODO remove after this implemented
      /**createTimeEntry(durationInMilliseconds: number, start: Date, end: Date, text: string, additionalData: ServiceObject[]): Promise<TimeEntry | null> {
    throw new Error("Method not implemented.");
  } */
      if (otherServiceDefinition.serviceDefinition.name !== 'TogglTrack') {
        // create real time entry object in the other services
        const createdTimeEntry = await otherServiceDefinition.syncedService.createTimeEntry(
          timeEntry.durationInMilliseconds, new Date(timeEntry.start), new Date(timeEntry.end), timeEntry.text, serviceObjectsMappings,
        );

        if (createdTimeEntry) {
          newTimeEntrySyncedObjectResult.serviceTimeEntryObjects.push(
            new ServiceTimeEntryObject(createdTimeEntry.id, otherServiceDefinition.serviceDefinition.name, false)
          );

          // lastly created -> update lastUpdate
          newTimeEntrySyncedObjectResult.lastUpdated = new Date(createdTimeEntry.lastUpdated).getTime();
        }
      }
    }

    if (newTimeEntrySyncedObjectResult.serviceTimeEntryObjects.length === 0) {
      return null
    }

    // console.log(newTimeEntrySyncedObjectResult);
    return newTimeEntrySyncedObjectResult;
  }

}

/**
 * Helper wrapper class that is not used anywhere else (not exported)
 */
class ServiceTimeEntriesWrapper {
  serviceDefinition: ServiceDefinition;
  syncedService: SyncedService;
  timeEntries: TimeEntry[];

  constructor(serviceDefinition: ServiceDefinition, syncedService: SyncedService, timeEntries: TimeEntry[]) {
    this.serviceDefinition = serviceDefinition;
    this.syncedService = syncedService;
    this.timeEntries = timeEntries;
  }
}