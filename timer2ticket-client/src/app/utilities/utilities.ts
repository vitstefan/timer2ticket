export class Utilities {
  static getOnlyDateString(date: Date): string {
    return date.toISOString().substring(0, 10);
  }

  /**
   * Returns negative if date1 is before date2, positive if date1 is after date2, zero if date1 === date2 (exact match)
   * @param date1 
   * @param date2 
   */
  static compare(date1: Date, date2: Date): number {
    return date1.getTime() - date2.getTime();
  }

  /**
   * Compares only date parts (Y,M,d): returns negative if date1 is before date2, positive if date1 is after date2, zero if date1 === date2 (exact match)
   * @param date1 
   * @param date2 
   */
  static compareOnlyDate(date1: Date, date2: Date): number {
    const year1 = date1.getFullYear(), year2 = date2.getFullYear();
    const month1 = date1.getMonth(), month2 = date2.getMonth();
    const day1 = date1.getDate(), day2 = date2.getDate();

    return year1 !== year2
      ? year1 - year2
      : (month1 !== month2
        ? month1 - month2
        : (day1 - day2));
  }
}