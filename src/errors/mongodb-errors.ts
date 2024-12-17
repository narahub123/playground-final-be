import {
  BadRequestError,
  ConflictError,
  GatewayTimeoutError,
  ServiceUnavailableError,
  UnprocessableEntityError,
} from "./http-errors";

class MongoDBDuplicateKeyError extends ConflictError {
  constructor(message?: string) {
    super(message || "Duplicate key error: 중복된 키가 존재합니다.");
    this.statusText = "Duplicate key conflict";
  }
}

class MongoDBValidationError extends UnprocessableEntityError {
  constructor(message?: string) {
    super(message || "MongoDB 스키마 유효성 검사 실패");
    this.statusText = "MongoDB Validation Error";
  }
}

class MongoDBCastError extends BadRequestError {
  constructor(message?: string) {
    super(message || "MongoDB 데이터 타입 변환 실패");
    this.statusText = "MongoDB Cast Error";
  }
}

class MongoDBNetworkError extends ServiceUnavailableError {
  constructor(message?: string) {
    super(message || "MongoDB 서버 연결 실패");
    this.statusText = "MongoDB 서버 연결 실패";
  }
}

class MongoDBTimeoutError extends GatewayTimeoutError {
  constructor(message?: string) {
    super(message || "MongoDB 요청 시간 초과");
    this.statusText = "MongoDB Timeout Error";
  }
}

export {
  MongoDBDuplicateKeyError, // 409
  MongoDBValidationError, // 422
  MongoDBCastError, // 400
  MongoDBNetworkError, // 503
  MongoDBTimeoutError, // 504
};
