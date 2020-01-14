export class Exception extends Error {
  /**
   * Message of the exception
   */
  public message: string;
  /**
   * Exception type
   * @type {string}
   */
  public type: string = 'HTTP_EXCEPTION';
  /**
   * Stack calling
   */
  public stack: string;
  public innerException: Error;
  /**
   * HTTP Code Status
   */
  public status: number;

  /**
   *
   * @param status
   * @param message
   * @param innerException
   */
  constructor (status: any, message?: string, innerException?: any) {
    super(message);
    this.status = status;
    this.message = message || '';

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);

    if (innerException) {
      if (innerException instanceof Error) {
        this.innerException = innerException as Error;
        this.message = this.message + ', innerException: ' + this.innerException.message;
      } else if (typeof innerException === 'string') {
        this.innerException = new Error(innerException);
        this.message = this.message + ', innerException: ' + this.innerException.message;
      } else {
        this.innerException = innerException as Error;
        this.message = this.message + ', innerException: ' + this.innerException;
      }
    }

    this.message = (this.message + ' ').trim();
  }

  public toString () {
    // console.warn(this.type + ": " + this.status + " " + this.name  + " => " + this.message)
    return (this.name + '(' + this.status + '): ' + this.message + ' ').trim();
  }

}

