import jwt from "jsonwebtoken";

/**
 * Refresh Token을 생성하는 함수
 *
 * @param {string} userId - 사용자 고유 아이디
 * @param {number} expiresIn - 토큰의 만료 시간 (초 단위)
 * @returns {string} - 생성된 Refresh Token
 *
 * @throws {Error} - 사용자 아이디가 제공되지 않으면 에러 발생
 * @throws {Error} - 유효 기간이 제공되지 않으면 에러 발생
 * @throws {Error} - JWT_SECRET_KEY가 정의되지 않으면 에러 발생
 */
const createRefreshToken = (userId: string, expiresIn: number): string => {
  // 사용자 아이디가 제공되지 않으면 에러 발생
  if (!userId) {
    throw new Error("유효하지 사용자 아이디 제공");
  }

  // 유효 기간이 제공되지 않으면 에러 발생
  if (!expiresIn) {
    throw new Error("유효 기간은 반드시 제공되어야 함");
  }

  // JWT 암호화에 사용할 비밀 키를 환경 변수에서 읽음
  const secret = process.env.JWT_SECRET_KEY;

  // JWT_SECRET_KEY가 정의되지 않으면 에러 발생
  if (!secret) {
    throw new Error("JWT_SECRET_KEY가 정의되어 있지 않음");
  }

  // Refresh Token을 생성 후 반환
  return jwt.sign({ userId }, secret, { expiresIn });
};

export default createRefreshToken;
