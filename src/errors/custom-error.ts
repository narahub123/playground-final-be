class CustomAPIError extends Error {
  statusCode: number;
  statusText: string;

  constructor(
    message: string,
    statusCode: number = 500,
    statusText: string = "내부 에러"
  ) {
    super(message);
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomAPIError;
