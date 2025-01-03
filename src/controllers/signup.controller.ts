import { Request, Response } from "express";
import { asyncWrapper } from "@middlewares";
import { checkEmailDuplicate } from "@services";
import { BadRequestError } from "@errors";

/**
 * 회원 가입 시 이메일 중복 확인 API 핸들러
 *
 * 이 함수는 사용자가 제공한 이메일이 이미 등록된 이메일인지 확인합니다.
 * 중복된 이메일이 있을 경우, 이를 클라이언트에 알려주는 역할을 합니다.
 *
 * @param {Request} req - Express 요청 객체, 본문에 이메일을 포함해야 합니다.
 * @param {Response} res - Express 응답 객체, 중복 여부를 JSON 형식으로 반환합니다.
 * @throws {BadRequestError} 이메일이 제공되지 않으면 `BadRequestError`를 발생시킵니다.
 * @returns {Object} - 이메일 중복 여부를 포함하는 객체 형식의 응답을 반환합니다.
 *                      예시: `{ isDuplicate: true }` 또는 `{ isDuplicate: false }`
 */
const checkEmailDuplicateInSignup = asyncWrapper(
  "checkEmailDuplicateInSignup",
  async (req: Request, res: Response) => {
    // 요청 본문에서 이메일을 추출합니다.
    const { email } = req.body;

    // 이메일이 제공되지 않았을 경우 BadRequestError를 던집니다.
    if (!email) {
      throw new BadRequestError("이메일을 제공해주세요.");
    }

    // 이메일 중복 체크
    const isDuplicate = await checkEmailDuplicate(email);

    // 중복 여부를 클라이언트에 JSON 형식으로 반환합니다.
    res.status(200).json({ isDuplicate });
  }
);

export { checkEmailDuplicateInSignup };
