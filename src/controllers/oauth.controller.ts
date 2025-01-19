import { Request, Response } from "express";
import { asyncWrapper } from "@middlewares";
import { getOauthAccessToken, getOauthUserInfo } from "@utils";
import { OauthType, UserData } from "@types";
import { BASE_URL } from "@constants";
import { BadRequestError } from "@errors";
import { checkEmailDuplicate } from "@services";

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

      if (!userData) {
        throw new Error("유저 정보 취득 실패");
      }

      // 기존 유저 여부 확인하기
      const user = await checkEmailDuplicate(userData.email);

      // 기존 유저 정보가 존재한다면 로그인 과정으로
      if (user) {
      } else {
        // 기존 유저 정보가 존재하지 않는다면 회원 가입 과정으로
        // 쿠키로 사용자 정보를 전송
        res.cookie("oauth_user", JSON.stringify(userData), {
          maxAge: 1000 * 60 * 60,
        });

        // 리다이렉트 주소를 oauth/callback으로 함
        res.redirect(`${BASE_URL}/oauth/callback`);
      }
    }
  }
);

export { oauthCallback };
