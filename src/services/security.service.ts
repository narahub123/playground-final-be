import { Security } from "@models";
import {
  MongoDBCastError,
  MongoDBDuplicateKeyError,
  MongoDBNetworkError,
  MongoDBTimeoutError,
  MongoDBValidationError,
  NotFoundError,
} from "@errors";
import mongoose from "mongoose";

const createUserSecurity = async (
  security: any,
  options?: { session?: mongoose.ClientSession }
) => {
  try {
    const newSecurity = await Security.create([security], options);

    return newSecurity;
  } catch (error: any) {
    console.error(`[createUserSecurity] Error: ${error.message}`, {
      security,
      stack: error.stack,
    });

    // MongoDB 관련 에러 처리
    if (error.code === 11000) {
      // 중복 키 오류
      const duplicatedField = Object.keys(error.keyValue)[0];
      const duplicatedValue = Object.values(error.keyValue)[0];

      throw new MongoDBDuplicateKeyError(
        `${duplicatedValue}는 ${duplicatedField}에 이미 존재하고 있습니다.`
      );
    }

    if (error.name === "ValidationError") {
      // MongoDB 스키마 유효성 검사 실패
      throw new MongoDBValidationError("사용자 데이터 유효성 검증 실패");
    }

    if (error.name === "CastError") {
      // 데이터 타입 변환 오류
      throw new MongoDBCastError("잘못된 데이터 형식입니다.");
    }

    if (error.name === "MongoNetworkError") {
      // 네트워크 오류
      throw new MongoDBNetworkError("MongoDB 서버 연결 실패");
    }

    if (error.name === "MongoTimeoutError") {
      // 요청 시간 초과 오류
      throw new MongoDBTimeoutError("MongoDB 요청 시간 초과");
    }

    throw error;
  }
};

export { createUserSecurity };
