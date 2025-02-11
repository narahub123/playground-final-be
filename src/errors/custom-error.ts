class CustomAPIError extends Error {
  statusCode: number;
  statusText: string;
  code: string;
  errorDetails: Record<string, string>;

  constructor(
    message: string,
    statusCode: number = 500,
<<<<<<< Updated upstream
    statusText: string = "Internal Error",
    code: string = "INTERNAL_ERROR"
=======
    statusText: string = "Internal Server Error",
    code: string = "INTERNAL_SERVER_ERROR",
    errorDetails: Record<string, string> = {}
>>>>>>> Stashed changes
  ) {
    super(message);
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.code = code;
    this.name = this.constructor.name;
    this.errorDetails = errorDetails;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomAPIError;
