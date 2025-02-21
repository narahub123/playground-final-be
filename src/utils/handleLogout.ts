import { activeSessionService, authService } from "@services";
import clearRefreshTokenCookie from "./clearRefreshTokenCookie";
import { Request, Response } from "express";
import { LogoutReasonType } from "@types";
import { Types } from "mongoose";

// refresh token 쿠키 삭제 및 로그아웃 처리
const handleLogout = async (
  activeSessionId: Types.ObjectId,
  res: Response,
  message: string,
  code: string,
  logoutReason: LogoutReasonType,
  statusCode: number
) => {
  await authService.logout(activeSessionId, logoutReason);

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

const handleTokenExpirationLogout = async (
  req: Request,
  res: Response,
  message: string,
  code: string
) => {
  const sessionId = req.headers[`x-active-session-id`] as string;
  const activeSessionId = new Types.ObjectId(sessionId);

  await handleLogout(
    activeSessionId,
    res,
    message,
    code,
    "SESSION_EXPIRED",
    401
  );
};

export { handleLogout, handleTokenExpirationLogout };
