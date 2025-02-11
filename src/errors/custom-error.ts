class CustomAPIError extends Error {
  statusCode: number;
  statusText: string;
  code: string;

  constructor(
    message: string,
    statusCode: number = 500,
    statusText: string = "Internal Error",
    code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomAPIError;
