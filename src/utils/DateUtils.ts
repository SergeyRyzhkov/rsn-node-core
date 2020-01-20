export class DateUtils {

  // -------------------------------------------------------------------------
  // Public Static Methods
  // -------------------------------------------------------------------------

  /**
   * Normalizes date object hydrated from the database.
   */
  public static normalizeHydratedDate (mixedDate: Date | string | undefined): Date | string | undefined {
    if (!mixedDate) {
      return mixedDate;
    }

    return typeof mixedDate === 'string' ? new Date(mixedDate) : mixedDate as Date;
  }

  /**
   * Converts given value into date string in a "YYYY-MM-DD" format.
   */
  public static mixedDateToDateString (value: Date | any): string | any {
    if (value instanceof Date) {
      return this.formatZerolessValue(value.getFullYear()) + '-' + this.formatZerolessValue(value.getMonth() + 1) + '-' + this.formatZerolessValue(value.getDate());
    }

    return value;
  }

  /**
   * Converts given value into date object.
   */
  public static mixedDateToDate (mixedDate: Date | string, toUtc: boolean = false, useMilliseconds = true): Date {
    let date = typeof mixedDate === 'string' ? new Date(mixedDate) : mixedDate;

    if (toUtc) {
      date = new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds()
      );
    }

    if (!useMilliseconds) {
      date.setUTCMilliseconds(0);
    }

    return date;
  }

  /**
   * Converts given value into time string in a "HH:mm:ss" format.
   */
  public static mixedDateToTimeString (value: Date | any, skipSeconds: boolean = false): string | any {
    if (value instanceof Date) {
      return this.formatZerolessValue(value.getHours()) +
        ':' + this.formatZerolessValue(value.getMinutes()) +
        (!skipSeconds ? ':' + this.formatZerolessValue(value.getSeconds()) : '');
    }

    return value;
  }

  /**
   * Converts given value into time string in a "HH:mm:ss" format.
   */
  public static mixedTimeToDate (value: Date | any): string | any {
    if (typeof value === 'string') {
      const [hours, minutes, seconds] = value.split(':');
      const date = new Date();
      if (hours) {
        date.setHours(parseInt(hours, 2));
      }
      if (minutes) {
        date.setMinutes(parseInt(minutes, 2));
      }
      if (seconds) {
        date.setSeconds(parseInt(seconds, 2));
      }
      return date;
    }

    return value;
  }

  /**
   * Converts given string value with "-" separator into a "HH:mm:ss" format.
   */
  public static mixedTimeToString (value: string | any, skipSeconds: boolean = false): string | any {
    value = value instanceof Date ? (value.getHours() + ':' + value.getMinutes() + (!skipSeconds ? ':' + value.getSeconds() : '')) : value;
    if (typeof value === 'string') {
      return value.split(':')
        .map((v) => v.length === 1 ? '0' + v : v) // append zero at beginning if we have a first-zero-less number
        .join(':');
    }

    return value;
  }

  /**
   * Converts given value into datetime string in a "YYYY-MM-DD HH-mm-ss" format.
   */
  public static mixedDateToDatetimeString (value: Date | any, useMilliseconds?: boolean): string | any {
    if (typeof value === 'string') {
      value = new Date(value);
    }
    if (value instanceof Date) {
      let finalValue = this.formatZerolessValue(value.getFullYear()) + '-' +
        this.formatZerolessValue(value.getMonth() + 1) + '-' +
        this.formatZerolessValue(value.getDate()) + ' ' +
        this.formatZerolessValue(value.getHours()) + ':' +
        this.formatZerolessValue(value.getMinutes()) + ':' +
        this.formatZerolessValue(value.getSeconds());

      if (useMilliseconds) {
        finalValue += `.${this.formatMilliseconds(value.getMilliseconds())}`;
      }

      value = finalValue;
    }


    return value;
  }

  /**
   * Converts given value into utc datetime string in a "YYYY-MM-DD HH-mm-ss.sss" format.
   */
  public static mixedDateToUtcDatetimeString (value: Date | any): string | any {
    if (typeof value === 'string') {
      value = new Date(value);
    }
    if (value instanceof Date) {
      return this.formatZerolessValue(value.getUTCFullYear()) + '-' +
        this.formatZerolessValue(value.getUTCMonth() + 1) + '-' +
        this.formatZerolessValue(value.getUTCDate()) + ' ' +
        this.formatZerolessValue(value.getUTCHours()) + ':' +
        this.formatZerolessValue(value.getUTCMinutes()) + ':' +
        this.formatZerolessValue(value.getUTCSeconds()) + '.' +
        this.formatMilliseconds(value.getUTCMilliseconds());
    }

    return value;
  }

  /**
   * Converts each item in the given array to string joined by "," separator.
   */
  public static simpleArrayToString (value: any[] | any): string[] | any {
    if (value instanceof Array) {
      return (value as any[])
        .map((i) => String(i))
        .join(',');
    }

    return value;
  }

  /**
   * Converts given string to simple array split by "," separator.
   */
  public static stringToSimpleArray (value: string | any): string | any {
    if (value instanceof String || typeof value === 'string') {
      if (value.length > 0) {
        return value.split(',');
      } else {
        return [];
      }
    }

    return value;
  }

  public static simpleJsonToString (value: any): string {
    return JSON.stringify(value);
  }

  public static stringToSimpleJson (value: any) {
    try {
      const simpleJSON = JSON.parse(value);
      return (typeof simpleJSON === 'object') ? simpleJSON : {};
    } catch (err) {
      return {};
    }
  }

  public static simpleEnumToString (value: any) {
    return '' + value;
  }

  // -------------------------------------------------------------------------
  // Private Static Methods
  // -------------------------------------------------------------------------

  /**
   * Formats given number to "0x" format, e.g. if it is 1 then it will return "01".
   */
  private static formatZerolessValue (value: number): string {
    if (value < 10) {
      return '0' + value;
    }

    return String(value);
  }

  /**
   * Formats given number to "0x" format, e.g. if it is 1 then it will return "01".
   */
  private static formatMilliseconds (value: number): string {
    if (value < 10) {
      return '00' + value;
    } else if (value < 100) {
      return '0' + value;
    } else {
      return String(value);
    }
  }

}
