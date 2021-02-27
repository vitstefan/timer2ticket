import { ServiceDefinition } from "../models/service_definition/service_definition";
import { TimeEntryManager } from "./time_entry_manager";
import { TogglTimeEntryManager } from "./toggl/toggl_time_entry_manager";
import { RedmineTimeEntryManager } from "./redmine/redmine_time_entry_manager";

export class TimeEntryManagerCreator {
  static create(serviceDefinition: ServiceDefinition): TimeEntryManager {
    switch (serviceDefinition.name) {
      case 'TogglTrack':
        return new TogglTimeEntryManager(serviceDefinition);
      default:
        return new RedmineTimeEntryManager(serviceDefinition);
    }
  }
}