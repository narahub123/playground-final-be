import { ACCESSTOKEN_EXPIRES } from "@constants";
import { activeSessionService, userService } from "@services";
import { createAccessToken, handleLogout } from "@utils";
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

  if (!accessToken || !refresh) {
    await handleLogout(
      refresh,
      res,
      "Access or refresh token missing. (액세스 혹은 리프레시 토큰 없음)",
      "TOKEN_MISSING",
      "SESSION_EXPIRED"
    );
    return;
  }

  try {
    const activeSession =
      await activeSessionService.getActiveSessionByRefreshToken(refresh);

    if (!activeSession) {
      await handleLogout(
        refresh,
        res,
        "Active session not found for the given token, logged out. (활성 섹션 조회 실패로 인한 로그아웃)",
        "ACTIVE_SESSION_NOT_FOUND",
        "SESSION_EXPIRED"
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
        "USER_NOT_FOUND",
        "SESSION_EXPIRED"
      );
      return;
    }

    req.user = user;
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
          "TOKEN_EXPIRED",
          "SESSION_EXPIRED"
        );

        return;
      }

      // 활성 세션 존재하면 access token 발급
      const newAccessToken = createAccessToken(
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
          "USER_NOT_FOUND",
          "SESSION_EXPIRED"
        );

        return;
      }

      res.status(200).json({
        success: true,
        message:
          "Access token has been successfully reissued. (액세스 토큰 재발급)",
        code: "ACCESS_TOKEN_REISSUED",
        timestamp: new Date().toISOString(),
        data: {
          accessToken: newAccessToken,
        },
      });
      // 잘못된 access 토큰인 경우
    } else if (err.name === "JsonWebTokenError") {
      await handleLogout(
        refresh,
        res,
        "Invalid access token. (잘못된 액세스 토큰) ",
        "INVALID_TOKEN",
        "SESSION_EXPIRED"
      );
      return;
    } else {
      // 로그아웃
      await handleLogout(
        refresh,
        res,
        "An error occurred while processing your request, logged out. (요청 처리 중 오류가 발생하여 로그아웃)",
        "LOGOUT_ERROR",
        "SESSION_EXPIRED"
      );
      return;
    }
  }
};

export default authTokenMiddleware;
