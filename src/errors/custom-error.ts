class CustomAPIError extends Error {
  statusCode: number;
  statusText: string;
  errorCode: string;

  constructor(
    message: string,
    statusCode: number = 500,
    statusText: string = "Internal Error",
    errorCode: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.errorCode = errorCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomAPIError;
