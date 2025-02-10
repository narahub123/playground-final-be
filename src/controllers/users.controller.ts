import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "@errors";
import { asyncWrapper } from "@middlewares";
import { duplicateDetectionService, userService } from "@services";

const checkEmailAvailability = asyncWrapper(
  "checkEmailAvailability",
  async (req: Request, res: Response) => {
    // 요청 본문에서 이메일을 추출합니다.
    const { email } = req.body;

    // 이메일이 제공되지 않았을 경우 BadRequestError를 던집니다.
    if (!email) {
      throw new BadRequestError("이메일을 제공해주세요.");
    }

    // 이메일 중복 체크
    const isDuplicate = await duplicateDetectionService.checkEmailDuplication(
      email
    );

    // 중복 여부를 클라이언트에 JSON 형식으로 반환합니다.
    res.status(200).json({ success: true, data: { isDuplicate } });
  }
);

const checkPhoneAvailability = asyncWrapper(
  "checkPhoneAvailability",
  async (req: Request, res: Response) => {
    // 요청 본문에서 이메일을 추출합니다.
    const { phone } = req.body;

    // 휴대 전화 번호가 제공되지 않았을 경우 BadRequestError를 던집니다.
    if (!phone) {
      throw new BadRequestError("휴대 전화 번호를 제공해주세요.");
    }

    // 이메일 중복 체크
    const isDuplicate = await duplicateDetectionService.checkPhoneDuplication(
      phone
    );

    // 중복 여부를 클라이언트에 JSON 형식으로 반환합니다.
    res.status(200).json({ success: true, data: { isDuplicate } });
  }
);

const checkUserIdAvailability = asyncWrapper(
  "checkUserIdAvailability",
  async (req: Request, res: Response) => {
    // 요청 본문에서 이메일을 추출합니다.
    const { userId } = req.body;

    // 휴대 전화 번호가 제공되지 않았을 경우 BadRequestError를 던집니다.
    if (!userId) {
      throw new BadRequestError("휴대 전화 번호를 제공해주세요.");
    }

    // 이메일 중복 체크
    const isDuplicate = await duplicateDetectionService.checkUserIdDuplication(
      userId
    );

    // 중복 여부를 클라이언트에 JSON 형식으로 반환합니다.
    res.status(200).json({ success: true, data: { isDuplicate } });
  }
);

// 계정 정보로 연락처를 조회하는 API 핸들러
const getContactsBeforeLogin = asyncWrapper(
  "getContactsByAccount",
  async (req: Request, res: Response) => {
    // 요청 본문에서 사용자 ID, 이메일, 전화번호 추출
    const { userId, email, phone } = req.body;

    // 이메일, 휴대 전화 번호, 사용자 아이디 중 하나라도 없으면 BadRequestError 발생
    if (!userId && !email && !phone)
      throw new BadRequestError(
        "이메일, 휴대 전화 번호 혹은 사용자 아이디를 제공해주세요."
      );

    const user = await userService.findUserByIdentifier(email, phone, userId);

    res.status(200).json({
      success: true,
      data: { emails: user.email, phones: user.phone },
    });
  }
);

export {
  checkEmailAvailability,
  checkPhoneAvailability,
  checkUserIdAvailability,
  getContactsBeforeLogin,
};
