import { Response } from "express";

const clearRefreshTokenCookie = (res: Response) => {
  // refresh token을 쿠키에서 제거
  res.clearCookie("refresh", {
    httpOnly: true, // 클라이언트에서 JavaScript로 쿠키 접근 차단
    sameSite: "lax", // CSRF 공격 방지 설정
    secure: process.env.NODE_ENV === "production", // 프로덕션 환경에서만 https 사용
    path: "/", // 쿠키의 유효 범위
  });
};

export default clearRefreshTokenCookie;
