import { Mapping } from "../../models/mapping/mapping";
import { MappingsObject } from "../../models/mapping/mappings_object";
import { ServiceDefinition } from "../../models/service_definition/service_definition";
import { RedmineTimeEntry } from "../../models/synced_service/time_entry/redmine_time_entry";
import { TimeEntry } from "../../models/synced_service/time_entry/time_entry";
import { TimeEntryManager } from "../time_entry_manager";

export class RedmineTimeEntryManager implements TimeEntryManager {
  private _serviceDefinition: ServiceDefinition;

  private _projectsType: string;
  private _issuesType: string;
  private _timeEntryActivitiesType: string;

  constructor(serviceDefinition: ServiceDefinition) {
    this._serviceDefinition = serviceDefinition;

    this._projectsType = 'project';
    this._issuesType = 'issue';
    this._timeEntryActivitiesType = 'time entry activity';
  }

  /**
   * Extracts project, issue and time entry activity and returns them as mappingObjects
   * @param timeEntry 
   * @param mappings 
   */
  extractMappingsObjectsFromTimeEntry(timeEntry: TimeEntry, mappings: Mapping[]): MappingsObject[] {
    // this should not happen
    if (!(timeEntry instanceof RedmineTimeEntry)) return [];

    const mappingsObjectsResult: MappingsObject[] = [];
    for (const mapping of mappings) {
      // ===  'Redmine' (is stored in this._serviceDefinition.name)
      const redmineMappingsObject = mapping.mappingsObjects.find(mappingsObject => mappingsObject.service === this._serviceDefinition.name);

      if (redmineMappingsObject) {
        // find project's mapping - should have same id as timeEntry.projectId
        if ((redmineMappingsObject.id === timeEntry.projectId && redmineMappingsObject.type === this._projectsType)
          || (redmineMappingsObject.id === timeEntry.issueId && redmineMappingsObject.type === this._issuesType)
          || (redmineMappingsObject.id === timeEntry.activityId && redmineMappingsObject.type === this._timeEntryActivitiesType)) {
          const otherProjectMappingsObjects = mapping.mappingsObjects.filter(mappingsObject => mappingsObject.service !== this._serviceDefinition.name);
          // push to result all other than 'Redmine'
          mappingsObjectsResult.push(...otherProjectMappingsObjects);
        }
      }
    }
    return mappingsObjectsResult;
  }
}