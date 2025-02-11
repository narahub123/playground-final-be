import CustomAPIError from "./custom-error.js";

class BadRequestError extends CustomAPIError {
  constructor(
    message: string,
    code: string = "BAD_REQUEST",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 400, "Bad Request", code, errorDetails);
  }
}

class UnauthorizedError extends CustomAPIError {
  constructor(
    message: string,
    code: string = "UNAUTHORIZED",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 401, "Unauthorized", code, errorDetails);
  }
}

class ForbiddenError extends CustomAPIError {
  constructor(
    message: string,
    code: string = "FORBIDDEN",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 403, "Forbidden", code, errorDetails);
  }
}

class NotFoundError extends CustomAPIError {
  constructor(
    message: string,
    code: string = "NOT_FOUND",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 404, "Not Found", code, errorDetails);
  }
}

class ConflictError extends CustomAPIError {
  constructor(
    message: string,
    code: string = "CONFLICT",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 409, "Conflict", code, errorDetails);
  }
}

class GoneError extends CustomAPIError {
  constructor(
    message: string,
    code: string = "GONE",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 410, "Gone", code, errorDetails);
  }
}

class UnprocessableEntityError extends CustomAPIError {
  constructor(
    message: string,
    code: string = "UNPROCESSABLE_ENTITY",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 422, "Unprocessable Entity", code, errorDetails);
  }
}

class LockedError extends CustomAPIError {
  constructor(
    message: string,
    code: string = "LOCKED",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 423, "Locked", code, errorDetails);
  }
}

class ServiceUnavailableError extends CustomAPIError {
  constructor(
    message: string,
    code: string = "SERVICE_UNAVAILABLE",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 503, "Service Unavailable", code, errorDetails);
  }
}

class GatewayTimeoutError extends CustomAPIError {
  constructor(
    message: string,
    code: string = "GATEWAY_TIMEOUT",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 504, "Gateway Time Out", code, errorDetails);
  }
}

export {
  BadRequestError, // 400
  UnauthorizedError, // 401
  ForbiddenError, // 403
  NotFoundError, // 404
  ConflictError, // 409
  GoneError, // 410
  UnprocessableEntityError, // 422
  LockedError, // 423
  ServiceUnavailableError, // 503
  GatewayTimeoutError, // 504
};
