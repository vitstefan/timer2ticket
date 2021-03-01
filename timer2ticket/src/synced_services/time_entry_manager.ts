import { Mapping } from "../models/mapping/mapping";
import { MappingsObject } from "../models/mapping/mappings_object";
import { TimeEntry } from "../models/synced_service/time_entry/time_entry";

export interface TimeEntryManager {
  /**
   * Extracts objects from specific timeEntry, e.g. toggl extracts projectId from projectId, issue and time entry activity from TE's tags
   * @param timeEntry timeEntry object from which mappingsObjects are extracting - each specific manager has its specific time entry instance (e.g. TogglTimeEntry)
   * @param mappings user's mappings where to find mappingsObjects (by id)
   */
  extractMappingsObjectsFromTimeEntry(timeEntry: TimeEntry, mappings: Mapping[]): MappingsObject[];
}