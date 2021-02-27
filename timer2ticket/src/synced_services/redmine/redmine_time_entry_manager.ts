import { Mapping } from "../../models/mapping/mapping";
import { MappingsObject } from "../../models/mapping/mappings_object";
import { ServiceDefinition } from "../../models/service_definition/service_definition";
import { TimeEntry } from "../../models/synced_service/time_entry/time_entry";
import { TimeEntryManager } from "../time_entry_manager";

export class RedmineTimeEntryManager implements TimeEntryManager {
  private _serviceDefinition: ServiceDefinition;

  constructor(serviceDefinition: ServiceDefinition) {
    this._serviceDefinition = serviceDefinition;
  }

  getOtherMappingsObjects(timeEntry: TimeEntry, mappings: Mapping[]): MappingsObject[] {
    // TODO implement;
    return [];
  }
}