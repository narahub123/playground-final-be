import {
  BadRequestError,
  ConflictError,
  GatewayTimeoutError,
  ServiceUnavailableError,
  UnprocessableEntityError,
} from "./http-errors";

class MongoDBDuplicateKeyError extends ConflictError {
  constructor(
    message: string = "MongoDB Duplicate key error: 중복된 키가 존재합니다.",
    code: string = "DUPLICATE_KEY"
  ) {
    super(message, code);
  }
}

class MongoDBValidationError extends UnprocessableEntityError {
  constructor(
    message: string = "MongoDB 스키마 유효성 검사 실패",
    code: string = "MONGODB_VALIDATION_ERROR"
  ) {
    super(message, code);
  }
}

class MongoDBCastError extends BadRequestError {
  constructor(
    message: string = "MongoDB 데이터 타입 변환 실패",
    code: string = "MONGODB_CAST_ERROR"
  ) {
    super(message, code);
  }
}

class MongoDBNetworkError extends ServiceUnavailableError {
  constructor(
    message: string = "MongoDB 서버 연결 실패",
    code: string = "MONGODB_NETWORK_ERROR"
  ) {
    super(message, code);
  }
}

class MongoDBTimeoutError extends GatewayTimeoutError {
  constructor(
    message: string = "MongoDB 요청 시간 초과",
    code: string = "MONGODB_TIMEOUT_ERROR"
  ) {
    super(message, code);
  }
}

export {
  MongoDBDuplicateKeyError, // 409
  MongoDBValidationError, // 422
  MongoDBCastError, // 400
  MongoDBNetworkError, // 503
  MongoDBTimeoutError, // 504
};
