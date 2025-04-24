import { ACCESSTOKEN_EXPIRES } from "@constants";
import { InternalServerError } from "@errors";
import { activeSessionService, userService } from "@services";
import { createAccessToken } from "@utils";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose, { isValidObjectId, Types } from "mongoose";
import { handleTokenExpirationLogout } from "utils/handleLogout";

// 인증 토큰 미들웨어
const authTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.headers.authorization?.split(" ")[1]; // 요청 헤더에서 액세스 토큰 추출
  const sessionId = req.headers[`x-active-session-id`] as string; // 요청 헤더에서 세션 ID 추출
  const activeSessionId = new Types.ObjectId(sessionId); // 세션 ID를 ObjectId 타입으로 변환
  const { refresh } = req.cookies; // 쿠키에서 리프레시 토큰 추출

  const secret = process.env.JWT_SECRET_KEY as string; // JWT 비밀 키

  // 세션 ID 유효성 검사
  if (!sessionId || !isValidObjectId(sessionId)) {
    throw new InternalServerError(
      "Invalid or missing active session ID. (잘못되거나 누락된 세션 ID)",
      "LOGOUT",
      {
        activeSessionId: "INVALID_SESSION_ID",
      }
    );
  }

  // 토큰 존재 여부 검사
  if (!accessToken || !refresh) {
    await handleTokenExpirationLogout(
      req,
      res,
      "Access or refresh token missing. (액세스 혹은 리프레시 토큰 없음)",
      "TOKEN_MISSING"
    );
    return;
  }

  let activeSession;

  // 리프레시 토큰 검증
  try {
    const decodedRefreshToken = jwt.verify(refresh, secret) as JwtPayload;

    // 리프레시 토큰을 기반으로 활성 세션 조회
    activeSession = await activeSessionService.getActiveSessionByRefreshToken(
      refresh
    );

    // 활성 세션이 존재하지 않으면 로그아웃 처리
    if (!activeSession) {
      await handleTokenExpirationLogout(
        req,
        res,
        "Active session not found for the given token, logged out. (활성 섹션 조회 실패로 인한 로그아웃)",
        "ACTIVE_SESSION_NOT_FOUND"
      );
      return;
    }
  } catch (err: any) {
    // 리프레시 토큰 만료 처리
    if (err.name === "TokenExpiredError") {
      await handleTokenExpirationLogout(
        req,
        res,
        "Refresh token has been expired. (리프레시 토큰 만료)",
        "REFRESH_TOKEN_EXPIRED"
      );
      return;
    } else if (err.name === "JsonWebTokenError") {
      // 잘못된 리프레시 토큰 처리
      await handleTokenExpirationLogout(
        req,
        res,
        "Invalid refresh token. (잘못된 리프레시 토큰)",
        "INVALID_REFRESH_TOKEN"
      );
      return;
    }

    // 그 외 오류는 일반 로그아웃 처리
    await handleTokenExpirationLogout(
      req,
      res,
      "An error occurred while processing your request, logged out. (요청 처리 중 오류가 발생하여 로그아웃)",
      "LOGOUT_ERROR"
    );
    return;
  }

  // 액세스 토큰 검증
  try {
    // 액세스 토큰을 검증하여 사용자 정보 추출
    const decoded = jwt.verify(accessToken, secret) as JwtPayload;

    const userId = Types.ObjectId.createFromHexString(decoded.userId);

    // 사용자 정보 조회
    const user = await userService.getUserById(userId);

    // 사용자가 없으면 로그아웃 처리
    if (user === null) {
      await handleTokenExpirationLogout(
        req,
        res,
        "User not found for the given token. (사용자 조회 실패)",
        "USER_NOT_FOUND"
      );
      return;
    }

    // 요청 객체에 사용자 정보와 활성 세션 ID 추가
    req.user = user;
    req.activeSessionId = activeSessionId;
    next();
  } catch (err: any) {
    // 액세스 토큰 만료 처리
    if (err.name === "TokenExpiredError") {
      // 활성 세션이 존재하면 새 액세스 토큰을 발급
      const newAccessToken = createAccessToken(
        activeSession.userId,
        activeSession.userRole,
        ACCESSTOKEN_EXPIRES
      );

      // 사용자 조회
      const user = await userService.getUserById(activeSession.userId);

      // 사용자가 없으면 로그아웃 처리
      if (!user) {
        await handleTokenExpirationLogout(
          req,
          res,
          "User not found for the given token. (사용자 조회 실패)",
          "USER_NOT_FOUND"
        );
        return;
      }

      // 새 액세스 토큰을 응답으로 전송
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
      return;
    } else if (err.name === "JsonWebTokenError") {
      // 잘못된 액세스 토큰 처리
      await handleTokenExpirationLogout(
        req,
        res,
        "Invalid access token. (잘못된 액세스 토큰) ",
        "INVALID_ACCESS_TOKEN"
      );
      return;
    }

    // 그 외 오류는 로그아웃 처리
    await handleTokenExpirationLogout(
      req,
      res,
      "An error occurred while processing your request. (요청 처리 중 오류 발생)",
      "LOGOUT_ERROR"
    );
  }
};

export default authTokenMiddleware;
