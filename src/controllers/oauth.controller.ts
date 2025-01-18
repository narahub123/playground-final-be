import { Request, Response } from "express";
import { asyncWrapper } from "@middlewares";
import { getOauthAccessToken, getOauthUserInfo } from "@utils";
import { OauthType, UserData } from "@types";
import { BASE_URL } from "@constants";
import { BadRequestError } from "@errors";

const oauthCallback = asyncWrapper(
  "oauthCallback",
  async (req: Request, res: Response) => {
    const code = req.query.code as string | null;
    const type = req.query.state as OauthType | null;

    if (!code || !type) {
      throw new BadRequestError("인가 코드 혹은 인증 타입이 필요합니다.");
    }
    const accessToken = await getOauthAccessToken(code, type);

    if (accessToken && type) {
      const userData: UserData | undefined = await getOauthUserInfo(
        accessToken,
        type
      );

      console.log(userData);
    }
  }
);

export { oauthCallback };
