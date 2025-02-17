import { ACCESSTOKEN_EXPIRES } from "@constants";
import {
  activeSessionService,
  authService,
  loginRecordService,
  userService,
} from "@services";
import { ILogoutInfo } from "@types";
import {
  clearRefreshTokenCookie,
  createAccessToken,
  handleLogout,
} from "@utils";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const authTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  const { refresh } = req.cookies;

  const secret = process.env.JWT_SECRET_KEY as string;

  try {
    if (!accessToken) {
      await handleLogout(
        refresh,
        res,
        "Access token missing. (액세스 토큰이 없습니다.)",
        "TOKEN_MISSING"
      );
      return;
    }

    const decoded = jwt.verify(accessToken, secret) as JwtPayload;

    const user = await userService.getUserByUserId(decoded.userId);

    if (user === null) {
      // 로그아웃
      await handleLogout(
        refresh,
        res,
        "User not found for the given token, logged out. (사용자 조회 실패로 인한 로그아웃)",
        "USER_NOT_FOUND"
      );
    }

    req.user = user;
    req.accessToken = accessToken;
    next();
  } catch (err: any) {
    // access 토큰의 유효 기간이 만료된 경우
    if (err.name === "TokenExpiredError") {
      // 활성 세션 존재 확인
      const activeSession =
        await activeSessionService.getActiveSessionByRefreshToken(refresh);

      if (!activeSession) {
        await handleLogout(
          refresh,
          res,
          "Session expired due to refresh token expiration, logged out. (리프레시 토큰 만료로 인한 로그아웃)",
          "TOKEN_EXPIRED"
        );

        return;
      }

      // 활성 세션 존재하면 access token 발급
      const accessToken = createAccessToken(
        activeSession._id,
        activeSession.userId,
        activeSession.userRole,
        ACCESSTOKEN_EXPIRES
      );

      const user = await userService.getUserByUserId(activeSession.userId);
      if (!user) {
        // 로그아웃
        await handleLogout(
          refresh,
          res,
          "User not found for the given token, logged out. (사용자 조회 실패로 인한 로그아웃)",
          "USER_NOT_FOUND"
        );

        return;
      }

      req.user = user;
      req.accessToken = accessToken;
      next();
    } else {
      // 로그아웃
      await handleLogout(
        refresh,
        res,
        "An error occurred while processing your request, logged out. (요청 처리 중 오류가 발생하여 로그아웃)",
        "LOGOUT_ERROR"
      );
    }
  }
};

export default authTokenMiddleware;
