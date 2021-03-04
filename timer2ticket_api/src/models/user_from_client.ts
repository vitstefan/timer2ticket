import { ObjectId } from "mongodb";
import { JobDefinition } from "./job_definition";
import { Mapping } from "./mapping/mapping";
import { ServiceDefinition } from "./service_definition/service_definition";
import { User } from "./user";

export class UserFromClient {
  _id: string | ObjectId;
  username: string;
  status: string;
  configSyncJobDefinition: JobDefinition | null;
  timeEntrySyncJobDefinition: JobDefinition | null;
  serviceDefinitions: ServiceDefinition[];
  mappings: Mapping[];

  token: string;

  constructor(user: User, token: string) {
    this._id = user._id;
    this.username = user.username;
    this.status = user.status;
    this.configSyncJobDefinition = user.configSyncJobDefinition;
    this.timeEntrySyncJobDefinition = user.timeEntrySyncJobDefinition;
    this.serviceDefinitions = user.serviceDefinitions;
    this.mappings = user.mappings;

    this.token = token;
  }
}