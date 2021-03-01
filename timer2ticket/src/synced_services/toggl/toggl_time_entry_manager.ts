import { Mapping } from "../../models/mapping/mapping";
import { MappingsObject } from "../../models/mapping/mappings_object";
import { ServiceDefinition } from "../../models/service_definition/service_definition";
import { TimeEntry } from "../../models/synced_service/time_entry/time_entry";
import { TogglTimeEntry } from "../../models/synced_service/time_entry/toggl_time_entry";
import { TimeEntryManager } from "../time_entry_manager";

export class TogglTimeEntryManager implements TimeEntryManager {
  private _serviceDefinition: ServiceDefinition;

  private _projectsType: string;

  constructor(serviceDefinition: ServiceDefinition) {
    this._serviceDefinition = serviceDefinition;

    this._projectsType = 'project';
  }

  /**
   * Extracts project from timeEntry.project + issue and time entry activity etc from the tags
   * @param timeEntry 
   * @param mappings 
   */
  extractMappingsObjectsFromTimeEntry(timeEntry: TimeEntry, mappings: Mapping[]): MappingsObject[] {
    // this should not happen
    if (!(timeEntry instanceof TogglTimeEntry)) return [];

    const mappingsObjectsResult: MappingsObject[] = [];
    for (const mapping of mappings) {
      // ===  'TogglTrack' (is stored in this._serviceDefinition.name)
      const togglMappingsObject = mapping.mappingsObjects.find(mappingsObject => mappingsObject.service === this._serviceDefinition.name);

      if (togglMappingsObject) {
        // find project's mapping - should have same id as timeEntry.projectId
        if (togglMappingsObject.id === timeEntry.projectId && togglMappingsObject.type === this._projectsType) {
          const otherProjectMappingsObjects = mapping.mappingsObjects.filter(mappingsObject => mappingsObject.service !== this._serviceDefinition.name);
          // push to result all other than 'TogglTrack'
          mappingsObjectsResult.push(...otherProjectMappingsObjects);
        } else if (togglMappingsObject.type !== this._projectsType && timeEntry.tags) {
          // find other mappings in timeEntry's tags -> issues, time entry activity
          if (timeEntry.tags.find(tag => tag === togglMappingsObject.name)) {
            const otherProjectMappingsObjects = mapping.mappingsObjects.filter(mappingsObject => mappingsObject.service !== this._serviceDefinition.name);
            // push to result all other than 'TogglTrack'
            mappingsObjectsResult.push(...otherProjectMappingsObjects);
          }
        }
      }
    }
    return mappingsObjectsResult;
  }
}