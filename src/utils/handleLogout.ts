import { authService } from "@services";
import clearRefreshTokenCookie from "./clearRefreshTokenCookie";
import { Response } from "express";

// refresh token 쿠키 삭제 및 로그아웃 처리
const handleLogout = async (
  refresh: string | undefined,
  res: Response,
  message: string,
  code: string,
  statusCode: number = 401
) => {
  if (!refresh) return;

  await authService.logout(refresh);
  clearRefreshTokenCookie(res);

  const response = {
    success: false,
    message: message,
    code: code,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

export default handleLogout;
