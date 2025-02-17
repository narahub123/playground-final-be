import jwt from "jsonwebtoken";
import mongoose from "mongoose";

/**
 * Access Token을 생성하는 함수
 *
 * @param {mongoose.Types.ObjectId} activeSessionId - 활성 세션의 고유 ID
 * @param {string} user - 사용자의 ID 또는 고유 식별자
 * @param {string} role - 사용자의 역할 (예: admin, user)
 * @param {number} expiresIn - 토큰의 만료 시간 (초 단위)
 * @returns {string} - 생성된 Access Token
 *
 * @throws {Error} - JWT_SECRET_KEY가 정의되어 있지 않으면 에러를 던짐
 */
const createAccessToken = (
  activeSessionId: mongoose.Types.ObjectId,
  userId: string,
  role: string,
  expiresIn: number
): string => {
  // 토큰에 포함할 payload 객체
  const payload = {
    activeSessionId, // 활성 세션 ID
    userId, // 사용자 ID
    role, // 사용자 역할
  };

  // JWT 암호화에 사용할 비밀 키를 환경 변수에서 읽음
  const secret = process.env.JWT_SECRET_KEY;

  // 비밀 키가 정의되지 않은 경우 에러 발생
  if (!secret) throw new Error("JWT_SECRET_KEY가 정의되어 있지 않음");

  // JWT의 만료 시간을 설정하는 옵션
  const options = {
    expiresIn, // 만료 시간 (초 단위)
  };

  // payload와 옵션을 사용해 Access Token 생성 후 반환
  return jwt.sign(payload, secret, options);
};

export default createAccessToken;
