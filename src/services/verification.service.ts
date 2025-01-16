import { Verification } from "@models";
import {
  MongoDBCastError,
  MongoDBDuplicateKeyError,
  MongoDBNetworkError,
  MongoDBTimeoutError,
  MongoDBValidationError,
  NotFoundError,
} from "@errors";

interface Verification {
  userId: string;
  authCode: string;
  createdAt?: Date;
}

const createVerification = async (verification: Verification) => {
  try {
    const newVerificationCode = await Verification.create(verification);

    return newVerificationCode;
  } catch (error: any) {
    console.error(`[createVerification] Error: ${error.message}`, {
      verification,
      stack: error.stack,
    });

    // MongoDB 관련 에러 처리
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue).join(", ");
      throw new MongoDBDuplicateKeyError(
        `중복 키 오류: ${duplicateField} 필드가 이미 존재합니다.`
      );
    }

    if (error.name === "ValidationError") {
      // MongoDB 스키마 유효성 검사 실패
      throw new MongoDBValidationError(
        "인증 코드 데이터가 유효하지 않습니다. 다시 확인해주세요."
      );
    }

    if (error.name === "CastError") {
      // 데이터 타입 변환 오류
      throw new MongoDBCastError(
        "잘못된 데이터 형식입니다. 올바른 형식을 사용해주세요."
      );
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

export { createVerification };
