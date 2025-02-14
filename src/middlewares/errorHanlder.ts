import { CustomAPIError } from "@errors";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { IApiErrorResponse } from "@types";

dotenv.config({ path: ".env.development.local" }); // .env 파일에 정의된 환경 변수 로드

/**
 * 에러 처리 미들웨어
 * @param err - 처리할 에러 (CustomAPIError 또는 기타 에러)
 * @param req - Express 요청 객체
 * @param res - Express 응답 객체
 * @param next - 다음 미들웨어로 전달하는 함수
 */
const errorHandler = (
  err: { error: CustomAPIError | any; failureMessage: string } | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = err?.error ?? err ?? {};
  const failureMessage =
    err?.failureMessage || "An error occurred. (에러 발생)";
  const errorCode = err.errorCode;

  const {
    statusCode = 500,
    statusText = "Internal Server Error",
    message = "An unexpected error occurred. ()",
    code = "INTERNAL_SERVER_ERROR",
    errorDetails,
    type = "logic",
  } = error;

  // 에러 로그 기록
  if (process.env.NODE_ENV !== "production") {
    console.error(`[Error] ${message}`, {
      statusCode,
      statusText,
      stack: error.stack || err.stack,
    });
  }

  const errorResponse: IApiErrorResponse = {
    success: false,
    message: failureMessage || "An error occurred. (에러 발생)",
    statusCode,
    statusText,
    code: errorCode || "ERROR",
    timestamp: new Date().toISOString(),
    error: {
      type,
      message,
      code,
      ...(errorDetails ? { details: errorDetails } : {}),
    },
  };

  // 클라이언트에 에러 응답
  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
