export class JobDefinition {
  /**
   * Cron schedule format
   */
  schedule!: string;

  constructor(schedule: string) {
    this.schedule = schedule;
  }
}