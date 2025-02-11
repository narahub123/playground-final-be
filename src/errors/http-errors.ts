import CustomAPIError from "./custom-error.js";

class BadRequestError extends CustomAPIError {
<<<<<<< Updated upstream
  constructor(message: string, code: string = "BAD_REQUEST") {
    super(message, 400, "Bad Request", code);
=======
  constructor(
    message: string,
    code: string = "BAD_REQUEST",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 400, "Bad Request", code, errorDetails);
>>>>>>> Stashed changes
  }
}

class UnauthorizedError extends CustomAPIError {
<<<<<<< Updated upstream
  constructor(message: string, code: string = "UNAUTHORIZED") {
    super(message, 401, "Unauthorized", code);
=======
  constructor(
    message: string,
    code: string = "UNAUTHORIZED",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 401, "Unauthorized", code, errorDetails);
>>>>>>> Stashed changes
  }
}

class ForbiddenError extends CustomAPIError {
<<<<<<< Updated upstream
  constructor(message: string, code: string = "FORBIDDEN") {
    super(message, 403, "Forbidden", code);
=======
  constructor(
    message: string,
    code: string = "FORBIDDEN",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 403, "Forbidden", code, errorDetails);
>>>>>>> Stashed changes
  }
}

class NotFoundError extends CustomAPIError {
<<<<<<< Updated upstream
  constructor(message: string, code: string = "NOT_FOUND") {
    super(message, 404, "Not Found", code);
=======
  constructor(
    message: string,
    code: string = "NOT_FOUND",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 404, "Not Found", code, errorDetails);
>>>>>>> Stashed changes
  }
}

class ConflictError extends CustomAPIError {
<<<<<<< Updated upstream
  constructor(message: string, code: string = "CONFLICT") {
    super(message, 409, "Conflict", code);
=======
  constructor(
    message: string,
    code: string = "CONFLICT",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 409, "Conflict", code, errorDetails);
>>>>>>> Stashed changes
  }
}

class GoneError extends CustomAPIError {
<<<<<<< Updated upstream
  constructor(message: string, code: string = "GONE") {
    super(message, 410, "Gone", code);
=======
  constructor(
    message: string,
    code: string = "GONE",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 410, "Gone", code, errorDetails);
>>>>>>> Stashed changes
  }
}

class UnprocessableEntityError extends CustomAPIError {
<<<<<<< Updated upstream
  constructor(message: string, code: string = "UNPROCESSABLE_ENTITY") {
    super(message, 422, "Unprocessable Entity", code);
=======
  constructor(
    message: string,
    code: string = "UNPROCESSABLE_ENTITY",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 422, "Unprocessable Entity", code, errorDetails);
>>>>>>> Stashed changes
  }
}

class LockedError extends CustomAPIError {
<<<<<<< Updated upstream
  constructor(message: string, code: string = "LOCKED") {
    super(message, 423, "Locked", code);
=======
  constructor(
    message: string,
    code: string = "LOCKED",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 423, "Locked", code, errorDetails);
>>>>>>> Stashed changes
  }
}

class ServiceUnavailableError extends CustomAPIError {
<<<<<<< Updated upstream
  constructor(message: string, code: string = "SERVICE_UNAVAILABLE") {
    super(message, 503, "Service Unavailable", code);
=======
  constructor(
    message: string,
    code: string = "SERVICE_UNAVAILABLE",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 503, "Service Unavailable", code, errorDetails);
>>>>>>> Stashed changes
  }
}

class GatewayTimeoutError extends CustomAPIError {
<<<<<<< Updated upstream
  constructor(message: string, code: string = "GATEWAY_TIMEOUT") {
    super(message, 504, "Gateway Time Out", code);
=======
  constructor(
    message: string,
    code: string = "GATEWAY_TIMEOUT",
    errorDetails: Record<string, string> = {}
  ) {
    super(message, 504, "Gateway Time Out", code, errorDetails);
>>>>>>> Stashed changes
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
