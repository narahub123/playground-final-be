import { LoginFailure } from "@models";
import {
  MongoDBCastError,
  MongoDBDuplicateKeyError,
  MongoDBNetworkError,
  MongoDBTimeoutError,
  MongoDBValidationError,
  NotFoundError,
} from "@errors";
import { LoginFailureType } from "@types";
import { Types } from "mongoose";

// 특정 유저의 로그인 실패 기록 가져오기
const getLoginFailureByUserId = async (userId: string) => {
  try {
    return await LoginFailure.find({ userId });
  } catch (error: any) {
    console.error(`[getLoginFailureByUserId] Error: ${error.message}`, {
      userId,
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

const createLoginFailure = async (loginAttempt: LoginFailureType) => {
  try {
    return await LoginFailure.create(loginAttempt);
  } catch (error: any) {
    console.error(`[createLoginFailure] Error: ${error.message}`, {
      loginAttempt,
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

const updateFailureTypeToBruteForce = async (failureIds: Types.ObjectId[]) => {
  try {
    return await LoginFailure.updateMany(
      { _id: { $in: failureIds } },
      { $set: { failureType: "BruteForce" } }
    );
  } catch (error: any) {
    console.error(`[updateFailureTypeToBruteForce] Error: ${error.message}`, {
      failureIds,
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

export {
  getLoginFailureByUserId,
  createLoginFailure,
  updateFailureTypeToBruteForce,
};
