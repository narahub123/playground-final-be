import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "@errors";
import { asyncWrapper } from "@middlewares";
import { duplicateDetectionService, userService } from "@services";
import { IApiSuccessResponse } from "@types";

const checkEmailDuplication = asyncWrapper(
  "checkEmailDuplication",
  "Email duplicate check failed. (이메일 중복 체크 실패)",
  async (req: Request, res: Response) => {
    // 요청 본문에서 이메일을 추출합니다.
    const { email } = req.body;

    // 이메일이 제공되지 않았을 경우 BadRequestError를 던집니다.
    if (!email) {
      throw new BadRequestError(
        "Email is required. (이메일 필수)",
        "EMAIL_MISSING",
        {
          email: "이메일 필드가 제공되지 않았습니다.",
        }
      );
    }

    // 이메일 중복 체크
    const isDuplicate = await duplicateDetectionService.isEmailDuplicate(email);

    const response: IApiSuccessResponse<{ isDuplicate: boolean }> = {
      success: true,
      message: "Email duplicate check succeeded. (이메일 중복 체크 성공)",
      code: "EMAIL_DUPLICATE_CHECK_SUCCEEDED",
      timestamp: new Date().toISOString(),
      data: { isDuplicate },
    };

    // 중복 여부를 클라이언트에 JSON 형식으로 반환합니다.
    res.status(200).json(response);
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

const checkUserIdDuplication = asyncWrapper(
  "checkUserIdDuplication", // 함수의 이름
  "UserId duplicate check failed. (사용자 아이디 중복 체크 실패)", // 에러 메시지
  async (req: Request, res: Response) => {
    // 요청 본문에서 사용자 아이디를 추출합니다.
    const { userId } = req.body;

    // 사용자 아이디가 제공되지 않았을 경우 BadRequestError를 던집니다.
    if (!userId) {
      throw new BadRequestError(
        "UserId is required. (사용자 아이디 필수)", // 에러 메시지
        "USERID_MISSING", // 에러 코드
        {
          userId: "사용자 아이디가 제공되지 않았습니다.", // 에러 세부사항
        }
      );
    }

    // 사용자 아이디 중복 체크
    const isDuplicate = await duplicateDetectionService.isUserIdDuplicate(
      userId
    );

    // 성공적인 응답 생성
    const response: IApiSuccessResponse<{ isDuplicate: boolean }> = {
      success: true,
      message:
        "UserId duplicate check succeeded. (사용자 아이디 중복 체크 성공)", // 성공 메시지
      code: "USERID_DUPLICATE_CHECK_SUCCEEDED", // 응답 코드
      timestamp: new Date().toISOString(), // 응답 시각
      data: { isDuplicate }, // 중복 여부
    };

    // 중복 여부를 클라이언트에 JSON 형식으로 반환합니다.
    res.status(200).json(response);
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
  checkEmailDuplication,
  checkPhoneAvailability,
  checkUserIdDuplication,
  getContactsBeforeLogin,
};
