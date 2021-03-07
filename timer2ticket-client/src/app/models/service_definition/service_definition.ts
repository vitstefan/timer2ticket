import { Config } from "./config/config";

/**
 * This class contains definitions that are same for all services
 * Service dependent definitions are stored in config
 */
export class ServiceDefinition {
  name!: string;
  apiKey!: string;
  isPrimary!: boolean;
  config!: Config;

  constructor(name: string, isPrimary?: boolean) {
    this.name = name;
    this.apiKey = '';
    this.isPrimary = isPrimary ?? false;
    this.config = new Config();
  }
}