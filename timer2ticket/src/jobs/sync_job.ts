import { User } from "../models/user";

export interface SyncJob {
  /**
   * Does the job, returns true if successfully done, false otherwise and needs to be repeated
   */
  doTheJob(user: User): Promise<boolean>;
}