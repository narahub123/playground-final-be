import { Verification } from "@models";
import {
  MongoDBCastError,
  MongoDBDuplicateKeyError,
  MongoDBNetworkError,
  MongoDBTimeoutError,
  MongoDBValidationError,
  NotFoundError,
} from "@errors";
import mongoose from "mongoose";

interface Verification {
  userId: string;
  verificationCode: string;
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

// 사용자 아이디를 통해 인증 코드 정보를 가져오는 함수
const getVerificationCodeByUserId = async (userId: string) => {
  try {
    // 주어진 userId로 인증 코드 정보를 찾음
    return Verification.findOne({ userId });
  } catch (error: any) {
    // 에러 발생 시 로그에 유저 아이디 및 스택 트레이스를 포함하여 출력
    console.error(`[createVerification] Error: ${error.message}`, {
      userId,
      stack: error.stack,
    });

    // MongoDB 관련 에러 처리
    if (error.code === 11000) {
      // 중복 키 오류 (예: 같은 userId에 대한 중복된 인증 코드)
      const duplicateField = Object.keys(error.keyValue).join(", ");
      throw new MongoDBDuplicateKeyError(
        `중복 키 오류: ${duplicateField} 필드가 이미 존재합니다.`
      );
    }

    if (error.name === "ValidationError") {
      // MongoDB 스키마 유효성 검사 실패 시
      throw new MongoDBValidationError(
        "인증 코드 데이터가 유효하지 않습니다. 다시 확인해주세요."
      );
    }

    if (error.name === "CastError") {
      // 데이터 타입 변환 오류 시
      throw new MongoDBCastError(
        "잘못된 데이터 형식입니다. 올바른 형식을 사용해주세요."
      );
    }

    if (error.name === "MongoNetworkError") {
      // MongoDB 서버와의 네트워크 연결 오류
      throw new MongoDBNetworkError("MongoDB 서버 연결 실패");
    }

    if (error.name === "MongoTimeoutError") {
      // MongoDB 요청 시간이 초과된 경우
      throw new MongoDBTimeoutError("MongoDB 요청 시간 초과");
    }

    // 위의 조건에 해당하지 않는 다른 에러는 그대로 던짐
    throw error;
  }
};

// 인증 코드 삭제 함수
const deleteVerificationCode = async (id: mongoose.Types.ObjectId) => {
  try {
    // 주어진 id로 인증 코드 삭제 시도
    const result = await Verification.deleteOne({ _id: id });

    // 삭제된 결과 반환
    return result;
  } catch (error: any) {
    // 에러 발생 시 로그에 인증 코드 id 및 스택 트레이스를 포함하여 출력
    console.error(`[createVerification] Error: ${error.message}`, {
      id,
      stack: error.stack,
    });

    // MongoDB 관련 에러 처리
    if (error.code === 11000) {
      // 중복 키 오류 (예: 인증 코드에 중복된 데이터가 있을 때)
      const duplicateField = Object.keys(error.keyValue).join(", ");
      throw new MongoDBDuplicateKeyError(
        `중복 키 오류: ${duplicateField} 필드가 이미 존재합니다.`
      );
    }

    if (error.name === "ValidationError") {
      // MongoDB 스키마 유효성 검사 실패 시
      throw new MongoDBValidationError(
        "인증 코드 데이터가 유효하지 않습니다. 다시 확인해주세요."
      );
    }

    if (error.name === "CastError") {
      // 데이터 타입 변환 오류 발생 시
      throw new MongoDBCastError(
        "잘못된 데이터 형식입니다. 올바른 형식을 사용해주세요."
      );
    }

    if (error.name === "MongoNetworkError") {
      // MongoDB 서버와의 네트워크 연결 오류 시
      throw new MongoDBNetworkError("MongoDB 서버 연결 실패");
    }

    if (error.name === "MongoTimeoutError") {
      // MongoDB 요청 시간이 초과된 경우
      throw new MongoDBTimeoutError("MongoDB 요청 시간 초과");
    }

    // 위의 처리되지 않은 에러는 그대로 던짐
    throw error;
  }
};

export {
  createVerification,
  getVerificationCodeByUserId,
  deleteVerificationCode,
};
