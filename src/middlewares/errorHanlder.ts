import {
  CustomAPIError,
  MongoDBCastError,
  MongoDBDuplicateKeyError,
  MongoDBNetworkError,
  MongoDBTimeoutError,
  MongoDBValidationError,
} from "@errors";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config({ path: ".env.development.local" }); // .env 파일에 정의된 환경 변수 로드

/**
 * 에러 처리 미들웨어
 * @param err - 처리할 에러 (CustomAPIError 또는 기타 에러)
 * @param req - Express 요청 객체
 * @param res - Express 응답 객체
 * @param next - 다음 미들웨어로 전달하는 함수
 */
const errorHandler = (
  err: CustomAPIError | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 기본 에러 정보 설정
  let statusCode = err.statusCode || 500;
  let statusText = err.statusText || "Internal Server Error";
  let message = err.message || "내부 서버 에러가 발생했습니다.";

  // 몽고DB 관련 에러 처리
  if (err.code === 11000) {
    const mongoError = new MongoDBDuplicateKeyError(err.message);
    statusCode = mongoError.statusCode;
    statusText = mongoError.statusText;
    message = mongoError.message;
  } else if (err.name === "ValidationError") {
    const mongoError = new MongoDBValidationError(err.message);
    statusCode = mongoError.statusCode;
    statusText = mongoError.statusText;
    message = mongoError.message;
  } else if (err.name === "CastError") {
    const mongoError = new MongoDBCastError(err.message);
    statusCode = mongoError.statusCode;
    statusText = mongoError.statusText;
    message = mongoError.message;
  } else if (err.name === "MongoNetworkError") {
    const mongoError = new MongoDBNetworkError(err.message);
    statusCode = mongoError.statusCode;
    statusText = mongoError.statusText;
    message = mongoError.message;
  } else if (err.message?.includes("timeout")) {
    const mongoError = new MongoDBTimeoutError(err.message);
    statusCode = mongoError.statusCode;
    statusText = mongoError.statusText;
    message = mongoError.message;
  }

  // 에러 로그 기록
  if (process.env.NODE_ENV !== "production") {
    console.error(`[Error] ${message}`, {
      statusCode,
      statusText,
      stack: err.stack,
    });
  }

  // 클라이언트에 에러 응답
  res.status(statusCode).json({ statusText, message });
};

export default errorHandler;
