import { JobDefinition } from "./job_definition";
import { Mapping } from "./mapping/mapping";
import { ServiceDefinition } from "./service_definition/service_definition";

export class User {
  _id!: string;
  username!: string;
  registrated!: Date;
  status!: string;
  configSyncJobDefinition!: JobDefinition | null;
  timeEntrySyncJobDefinition!: JobDefinition | null;
  serviceDefinitions!: ServiceDefinition[];
  mappings!: Mapping[];

  token: string;
}