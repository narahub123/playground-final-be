import {
  MongoDBCastError,
  MongoDBDuplicateKeyError,
  MongoDBNetworkError,
  MongoDBTimeoutError,
  MongoDBValidationError,
} from "@errors";

const mongoDBErrorHandler = (
  method: string,
  error: any,
  params?: Record<string, any>
): never => {
  const errorDetails = {
    method,
    params,
    message: error.message,
    stack: error.stack,
  };

  console.error(`[${method}] error: ${error.message}`, errorDetails);

  // Duplicate Key Error 처리
  if (error.code === 11000) {
    throw new MongoDBDuplicateKeyError(
      "이미 존재하는 데이터입니다.",
      "DUPLICATE_KEY" // errorCode 추가
    );
  }

  // Validation Error 처리
  if (error.name === "ValidationError") {
    throw new MongoDBValidationError(
      error.message,
      "MONGODB_VALIDATION_ERROR" // errorCode 추가
    );
  }

  // Cast Error 처리
  if (error.name === "CastError") {
    throw new MongoDBCastError(
      "잘못된 데이터 타입입니다.",
      "MONGODB_CAST_ERROR" // errorCode 추가
    );
  }

  // MongoDB 네트워크 오류 처리
  if (error.message.includes("failed to connect")) {
    throw new MongoDBNetworkError(
      "MongoDB 서버 연결에 실패했습니다.",
      "MONGODB_NETWORK_ERROR" // errorCode 추가
    );
  }

  // MongoDB 타임아웃 오류 처리
  if (error.message.includes("timeout")) {
    throw new MongoDBTimeoutError(
      "MongoDB 요청이 시간 초과되었습니다.",
      "MONGODB_TIMEOUT_ERROR" // errorCode 추가
    );
  }

  // 예상치 못한 오류는 그대로 던짐
  throw error;
};

export default mongoDBErrorHandler;
