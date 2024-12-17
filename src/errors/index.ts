import CustomAPIError from "./custom-error";
import {
  BadRequestError, // 400
  UnauthorizedError, // 401
  ForbiddenError, // 403
  NotFoundError, // 404
  ConflictError, // 409
  UnprocessableEntityError, // 422
  ServiceUnavailableError, // 503
  GatewayTimeoutError, // 504
} from "./http-errors";
import {
  MongoDBDuplicateKeyError, // 409
  MongoDBValidationError, // 422
  MongoDBCastError, // 400
  MongoDBNetworkError, // 503
  MongoDBTimeoutError, // 504
} from "./mongodb-errors";
export {
  CustomAPIError,
  // http errors
  BadRequestError, // 400
  UnauthorizedError, // 401
  ForbiddenError, // 403
  NotFoundError, // 404
  ConflictError, // 409
  UnprocessableEntityError, // 422
  ServiceUnavailableError, // 503
  GatewayTimeoutError, // 504
  // mongodb errors
  MongoDBDuplicateKeyError, // 409
  MongoDBValidationError, // 422
  MongoDBCastError, // 400
  MongoDBNetworkError, // 503
  MongoDBTimeoutError, // 504
};
