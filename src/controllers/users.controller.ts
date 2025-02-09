import { Request, Response } from "express";
import { BadRequestError } from "@errors";
import { asyncWrapper } from "@middlewares";
import { checkEmailDuplication } from "@services";

const checkEmailAvailability = asyncWrapper(
  "checkEmailDuplicationInSignup",
  async (req: Request, res: Response) => {
    // 요청 본문에서 이메일을 추출합니다.
    const { email } = req.body;

    // 이메일이 제공되지 않았을 경우 BadRequestError를 던집니다.
    if (!email) {
      throw new BadRequestError("이메일을 제공해주세요.");
    }

    // 이메일 중복 체크
    const isDuplicate = await checkEmailDuplication(email);

    // 중복 여부를 클라이언트에 JSON 형식으로 반환합니다.
    res.status(200).json({ isDuplicate });
  }
);

export { checkEmailAvailability };
