import { REFRESHTOKEN_EXPIRES } from "@constants";
import { Response } from "express";

// refresh token을 쿠키에 저장 (보안 설정 포함)
const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie("refresh", refreshToken, {
    httpOnly: true, // 클라이언트에서 JavaScript로 쿠키 접근 차단
    maxAge:
      (Number(process.env.REFRESHTOKEN_EXPIRES) || REFRESHTOKEN_EXPIRES) * 1000, // 만료 시간 (밀리초 단위)
    sameSite: "lax", // CSRF 공격 방지 설정
    secure: process.env.NODE_ENV === "production", // 프로덕션 환경에서만 https 사용
  });
};

export default setRefreshTokenCookie;
