import CustomAPIError from "./custom-error.js";

class BadRequestError extends CustomAPIError {
  constructor(message: string, code: string = "BAD_REQUEST") {
    super(message, 400, "Bad Request", code);
  }
}

class UnauthorizedError extends CustomAPIError {
  constructor(message: string, code: string = "UNAUTHORIZED") {
    super(message, 401, "Unauthorized", code);
  }
}

class ForbiddenError extends CustomAPIError {
  constructor(message: string, code: string = "FORBIDDEN") {
    super(message, 403, "Forbidden", code);
  }
}

class NotFoundError extends CustomAPIError {
  constructor(message: string, code: string = "NOT_FOUND") {
    super(message, 404, "Not Found", code);
  }
}

class ConflictError extends CustomAPIError {
  constructor(message: string, code: string = "CONFLICT") {
    super(message, 409, "Conflict", code);
  }
}

class GoneError extends CustomAPIError {
  constructor(message: string, code: string = "GONE") {
    super(message, 410, "Gone", code);
  }
}

class UnprocessableEntityError extends CustomAPIError {
  constructor(message: string, code: string = "UNPROCESSABLE_ENTITY") {
    super(message, 422, "Unprocessable Entity", code);
  }
}

class LockedError extends CustomAPIError {
  constructor(message: string, code: string = "LOCKED") {
    super(message, 423, "Locked", code);
  }
}

class ServiceUnavailableError extends CustomAPIError {
  constructor(message: string, code: string = "SERVICE_UNAVAILABLE") {
    super(message, 503, "Service Unavailable", code);
  }
}

class GatewayTimeoutError extends CustomAPIError {
  constructor(message: string, code: string = "GATEWAY_TIMEOUT") {
    super(message, 504, "Gateway Time Out", code);
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
