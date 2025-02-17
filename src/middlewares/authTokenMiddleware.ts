import { ACCESSTOKEN_EXPIRES } from "@constants";
import { activeSessionService, userService } from "@services";
import { createAccessToken } from "@utils";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const authTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.headers.authorization;
  const { refresh } = req.cookies;

  const secret = process.env.JWT_SECRET_KEY as string;

  try {
    if (!accessToken) {
      // 로그아웃
      return;
    }

    const decoded = jwt.verify(accessToken, secret) as JwtPayload;

    const user = await userService.getUserByUserId(decoded.userId);

    if (user === null) {
      // 로그아웃
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
        // 로그아웃
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
        return;
      }

      req.user = user;
      req.accessToken = accessToken;
      next();
    } else {
      // 로그아웃
      return;
    }
  }
};

export default authTokenMiddleware;
