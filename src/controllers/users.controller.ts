import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "@errors";
import { asyncWrapper } from "@middlewares";
import {
  checkPhoneDuplication,
  checkUserIdDuplication,
  DuplicateDetection,
  getUserByEmail,
  getUserByPhone,
  getUserByUserId,
} from "@services";

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
    const isDuplicate = await DuplicateDetection.checkEmailDuplication(email);

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
    const isDuplicate = await checkPhoneDuplication(phone);

    // 중복 여부를 클라이언트에 JSON 형식으로 반환합니다.
    res.status(200).json({ isDuplicate });
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
    const isDuplicate = await checkUserIdDuplication(userId);

    // 중복 여부를 클라이언트에 JSON 형식으로 반환합니다.
    res.status(200).json({ isDuplicate });
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

    // 이메일, 전화번호, 사용자 ID를 기준으로 사용자를 찾기 위한 메서드 배열 정의
    const fetchUserMethods = [
      { key: email, fetch: getUserByEmail }, // 이메일로 사용자 조회
      { key: phone, fetch: getUserByPhone }, // 전화번호로 사용자 조회
      { key: userId, fetch: getUserByUserId }, // 사용자 ID로 사용자 조회
    ];

    // 주어진 키(email, phone, userId)를 기준으로 사용자 정보 조회
    for (const { key, fetch } of fetchUserMethods) {
      // 키가 존재하는 경우에만 해당 메서드를 사용하여 사용자 정보를 조회
      if (key) {
        const user = await fetch(key);

        // 사용자가 존재하면 이메일과 전화번호 반환
        if (user) {
          return res.status(200).json({
            success: true,
            data: { emails: user.email, phones: user.phone },
          });
        }
      }
    }

    // 모든 조건에 맞는 사용자를 찾지 못한 경우 NotFoundError 발생
    throw new NotFoundError("조건에 맞는 유저를 찾을 수 없습니다.");
  }
);

export {
  checkEmailAvailability,
  checkPhoneAvailability,
  checkUserIdAvailability,
  getContactsBeforeLogin,
};
