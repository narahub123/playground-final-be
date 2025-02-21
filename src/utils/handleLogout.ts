import { authService } from "@services";
import clearRefreshTokenCookie from "./clearRefreshTokenCookie";
import { Response } from "express";
import { LogoutReasonType } from "@types";

// refresh token 쿠키 삭제 및 로그아웃 처리
const handleLogout = async (
  refresh: string | undefined,
  res: Response,
  message: string,
  code: string,
  logoutReason: LogoutReasonType,
  statusCode: number = 401
) => {
  if (refresh) {
    await authService.logout(refresh, logoutReason);
  } else {
    
  }

  clearRefreshTokenCookie(res);

  const response = {
    success: statusCode === 200,
    message: message,
    code: statusCode === 200 ? code : "LOGOUT",
    error:
      statusCode === 200
        ? null
        : {
            details: {
              accessToken: code,
            },
          },
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

export default handleLogout;
