class CustomAPIError extends Error {
  statusCode: number;
  statusText: string;
  code: string;
  errorDetails: Record<string, any>;
  type: "database" | "logic";

  constructor(
    message: string,
    statusCode: number = 500,
    statusText: string = "Internal Server Error",
    code: string = "INTERNAL_SERVER_ERROR",
    errorDetails: Record<string, any> = {},
    type: "logic" | "database" = "logic"
  ) {
    super(message);
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.code = code;
    this.name = this.constructor.name;
    this.errorDetails = errorDetails;
    this.type = type;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomAPIError;
