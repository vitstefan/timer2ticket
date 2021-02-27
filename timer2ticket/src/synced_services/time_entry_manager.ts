import { Mapping } from "../models/mapping/mapping";
import { MappingsObject } from "../models/mapping/mappings_object";
import { TimeEntry } from "../models/synced_service/time_entry/time_entry";

export interface TimeEntryManager {
  getOtherMappingsObjects(timeEntry: TimeEntry, mappings: Mapping[]): MappingsObject[];
}