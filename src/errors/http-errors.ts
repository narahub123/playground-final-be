import CustomAPIError from "./custom-error.js";

class BadRequestError extends CustomAPIError {
  constructor(message: string) {
    super(message);
    this.statusCode = 400;
    this.statusText = "Bad Request";
  }
}

class UnauthorizedError extends CustomAPIError {
  constructor(message: string) {
    super(message);
    this.statusCode = 401;
    this.statusText = "Unauthorized";
  }
}

class ForbiddenError extends CustomAPIError {
  constructor(message: string) {
    super(message);
    this.statusCode = 403;
    this.statusText = "Forbidden";
  }
}

class NotFoundError extends CustomAPIError {
  constructor(message: string) {
    super(message);
    this.statusCode = 404;
    this.statusText = "Not Found";
  }
}

class ConflictError extends CustomAPIError {
  constructor(message: string) {
    super(message);
    this.statusCode = 409;
    this.statusText = "Conflict";
  }
}

class UnprocessableEntityError extends CustomAPIError {
  constructor(message: string) {
    super(message);
    this.statusCode = 422;
    this.statusText = "Unprocessable Entity";
  }
}

class ServiceUnavailableError extends CustomAPIError {
  constructor(message: string) {
    super(message);
    this.statusCode = 503;
    this.statusText = "Service Unavailable";
  }
}

class GatewayTimeoutError extends CustomAPIError {
  constructor(message: string) {
    super(message);
    this.statusCode = 504;
    this.statusText = "Gateway Time Out";
  }
}

export {
  BadRequestError, // 400
  UnauthorizedError, // 401
  ForbiddenError, // 403
  NotFoundError, // 404
  ConflictError, // 409
  UnprocessableEntityError, // 422
  ServiceUnavailableError, // 503
  GatewayTimeoutError, // 504
};
