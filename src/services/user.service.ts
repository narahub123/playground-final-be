import { User } from "@models";
import {
  MongoDBCastError,
  MongoDBDuplicateKeyError,
  MongoDBNetworkError,
  MongoDBTimeoutError,
  MongoDBValidationError,
  NotFoundError,
} from "@errors";

/**
 * 이메일 중복 확인 함수
 * @param {string} email - 중복 여부를 확인할 이메일 주소
 * @returns {Promise<boolean>} 이메일이 중복되었으면 `true`, 아니면 `false` 반환
 *
 * 이 함수는 주어진 이메일을 기준으로 데이터베이스에서 해당 이메일을 가진 사용자가 존재하는지 확인합니다.
 * 존재하면 `true`를, 존재하지 않으면 `false`를 반환합니다.
 *
 * @throws {Error} 이메일을 조회하는 도중 오류가 발생하면 예외를 던집니다.
 */
const checkEmailDuplicate = async (email: string): Promise<boolean> => {
  try {
    // 이메일을 기준으로 사용자 검색
    const user = await User.findOne({ email });

    // 사용자 존재 여부를 Boolean 값으로 반환
    return Boolean(user);
  } catch (error: any) {
    // 오류 발생 시 콘솔에 에러 정보 출력
    console.error(`[checkEmailDuplicate] Error: ${error.message}`, {
      email,
      stack: error.stack,
    });

    // 에러를 호출자에게 던짐
    throw error;
  }
};

/**
 * 주어진 사용자 아이디에 대해 중복 여부를 확인하는 함수
 *
 * @async
 * @function checkUserIdDuplicate
 * @param {string} userId - 중복 여부를 확인할 사용자 아이디
 * @throws {Error} 데이터베이스 조회 중 오류가 발생하면 발생
 * @returns {Promise<boolean>} 사용자 아이디의 중복 여부 (true: 중복, false: 중복 아님)
 *
 * @description
 * 이 함수는 주어진 사용자 아이디를 기준으로 데이터베이스에서 사용자를 검색하고,
 * 해당 아이디가 이미 존재하는지 여부를 반환합니다.
 * 만약 조회 중에 오류가 발생하면, 에러를 콘솔에 출력하고 호출자에게 전달합니다.
 */
const checkUserIdDuplicate = async (userId: string) => {
  try {
    // 사용자 아이디를 기준으로 사용자 검색
    const user = await User.findOne({ userId });

    // 사용자 존재 여부를 Boolean 값으로 반환
    return Boolean(user);
  } catch (error: any) {
    // 오류 발생 시 콘솔에 에러 정보 출력
    console.error(`[checkUserIdDuplicate] Error: ${error.message}`, {
      userId,
      stack: error.stack,
    });

    // 에러를 호출자에게 던짐
    throw error;
  }
};

const fetchUserByUserId = async (userId: string) => {
  try {
    const user = await User.findOne({ userId });
    if (!user) {
      throw new NotFoundError(
        `${userId} 아이디를 가진 유저를 찾을 수 없습니다.`
      );
    }
    return user;
  } catch (error: any) {
    console.error(`[fetchUserByUserId] Error: ${error.message}`, {
      userId,
      stack: error.stack,
    });
    throw error;
  }
};

const fetchUserByEmail = async (email: string) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError(
        `이메일 ${email}를 가진 유저를 찾을 수 없습니다.`
      );
    }
    return user;
  } catch (error: any) {
    console.error(`[fetchUserByUserId] Error: ${error.message}`, {
      email,
      stack: error.stack,
    });
    throw error;
  }
};

const fetchUserByPhone = async (phone: string) => {
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      throw new NotFoundError(
        `전화번호 ${phone}를 가진 유저를 찾을 수 없습니다.`
      );
    }
    return user;
  } catch (error: any) {
    console.error(`[fetchUserByUserId] Error: ${error.message}`, {
      phone,
      stack: error.stack,
    });
    throw error;
  }
};

const createUser = async (user: any) => {
  try {
    const newUser = await User.create(user);

    return newUser;
  } catch (error: any) {
    console.error(`[createUser] Error: ${error.message}`, {
      user,
      stack: error.stack,
    });

    // MongoDB 관련 에러 처리
    if (error.code === 11000) {
      // 중복 키 오류
      throw new MongoDBDuplicateKeyError("이미 존재하는 정보가 존재합니다.");
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
  fetchUserByUserId,
  fetchUserByEmail,
  fetchUserByPhone,
  checkEmailDuplicate,
  checkUserIdDuplicate,
  createUser,
};
