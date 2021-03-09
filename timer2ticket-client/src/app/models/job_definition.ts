export class JobDefinition {
  /**
   * Cron schedule format
   */
  schedule!: string;

  /**
   * Date (in number) indicating when this job was last successfully done
   */
  lastSuccessfullyDone!: number | null;

  constructor(schedule: string) {
    this.schedule = schedule;
    this.lastSuccessfullyDone = null;
  }
}