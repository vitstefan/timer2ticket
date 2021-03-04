export class JobDefinition {
  /**
   * When was last job done (should have been, by schedule).
   */
  lastJobDone!: Date;
  /**
   * Real date when last job was done (could be delayed etc.)
   */
  lastJobDoneReal!: Date;
  /**
   * Should be something like Monday, 15.00
   */
  jobStart!: Date;
  /**
   * For example each 15 minutes, 30 minutes, ..., 6 hours, 24 hours, 48 hours... (in seconds)
   * How it should work (few examples):
   * 
   * 1)
   * jobStart - Tuesday, 15.30
   * period - each 3 hours
   * => first Tuesday 15.30 - job, fill lastJobDone and lastJobDoneReal, then 18.30 (lastJobDone + period), then 21.30 etc.
   * 
   * 2)
   * jobStart - Tuesday, 15.30
   * period - each 48 hours
   * => first Tuesday 15.30 - job, fill lastJobDone and lastJobDoneReal, then Thursday 15.30 (lastJobDone + period), then Saturday 15.30 etc.
   * 
   * So jobStart day should be used for the first sync, then only hours should take and compute next sync
   */
  periodInSeconds!: number;
  schedule!: string;
}