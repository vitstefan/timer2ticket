import { Config } from "./config/config";

/**
 * This class contains definitions that are same for all services
 * Service dependent definitions are stored in config
 */
export class ServiceDefinition {
  id!: string;
  name!: string;
  apiKey!: string;
  isPrimary!: boolean;
  config!: Config;
}