import CustomAPIError from "./custom-error.js";

class BadRequestError extends CustomAPIError {
  constructor(message: string, errorCode: string = "BAD_REQUEST") {
    super(message, 400, "Bad Request", errorCode);
  }
}

class UnauthorizedError extends CustomAPIError {
  constructor(message: string, errorCode: string = "UNAUTHORIZED") {
    super(message, 401, "Unauthorized", errorCode);
  }
}

class ForbiddenError extends CustomAPIError {
  constructor(message: string, errorCode: string = "FORBIDDEN") {
    super(message, 403, "Forbidden", errorCode);
  }
}

class NotFoundError extends CustomAPIError {
  constructor(message: string, errorCode: string = "NOT_FOUND") {
    super(message, 404, "Not Found", errorCode);
  }
}

class ConflictError extends CustomAPIError {
  constructor(message: string, errorCode: string = "CONFLICT") {
    super(message, 409, "Conflict", errorCode);
  }
}

class GoneError extends CustomAPIError {
  constructor(message: string, errorCode: string = "GONE") {
    super(message, 410, "Gone", errorCode);
  }
}

class UnprocessableEntityError extends CustomAPIError {
  constructor(message: string, errorCode: string = "UNPROCESSABLE_ENTITY") {
    super(message, 422, "Unprocessable Entity", errorCode);
  }
}

class LockedError extends CustomAPIError {
  constructor(message: string, errorCode: string = "LOCKED") {
    super(message, 423, "Locked", errorCode);
  }
}

class ServiceUnavailableError extends CustomAPIError {
  constructor(message: string, errorCode: string = "SERVICE_UNAVAILABLE") {
    super(message, 503, "Service Unavailable", errorCode);
  }
}

class GatewayTimeoutError extends CustomAPIError {
  constructor(message: string, errorCode: string = "GATEWAY_TIMEOUT") {
    super(message, 504, "Gateway Time Out", errorCode);
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
