import { Request, Response } from "express";
import { asyncWrapper } from "@middlewares";
import {
  BadRequestError,
  CustomAPIError,
  NotFoundError,
  UnauthorizedError,
} from "@errors";
import {
  getUserByEmail,
  getUserByPhone,
  getUserByUserId,
  verficationService,
} from "@services";
import verificationService from "services/verification.service";
import { findUserByIdentifier } from "@utils";
import { verificationRepository } from "@repositories";

// 인증 코드 요청 핸들러
const requestLoginVerificationCode = asyncWrapper(
  "requestLoginVerificationCode",
  async (req: Request, res: Response) => {
    const { email, phone } = req.body;

    // 이메일 또는 휴대폰 번호가 제공되지 않은 경우
    if (!email && !phone)
      throw new BadRequestError("이메일 혹은 휴대 전화 번호를 제공해주세요.");

    if (email) {
      // 이메일로 인증 코드 전송
      // 이메일을 통해 사용자 정보를 조회
      const user = await getUserByEmail(email);

      // 이메일에 해당하는 유저가 없는 경우
      if (!user) throw new NotFoundError("해당 이메일을 가진 유저가 없습니다.");

      // 해당 사용자에 대한 인증 코드 존재 유무를 확인하고 있다면 삭제
      await verificationService.deleteExistingVerificationCode(user.userId);

      // 새로운 인증 코드 생성하고 이메이로 전송하기
      await verficationService.sendVerificationCode(email, user.userId);
    } else {
      // 휴대폰 인증 코드 전송 부분 (아직 구현되지 않음)
      // SMS 전송 로직은 추후 구현 필요
    }

    // 인증 코드 요청 성공 응답
    res
      .status(200)
      .json({ success: true, message: "인증코드가 전송되었습니다." });
  }
);

// 인증 코드 확인 핸들러
const checkLoginVerificationCode = asyncWrapper(
  "checkLoginVerificationCode",
  async (req: Request, res: Response) => {
    const { email, phone, userId, verificationCode } = req.body;

    // 필수 입력값 검증
    if (!email && !phone && !userId)
      throw new BadRequestError(
        "이메일, 휴대 전화 번호 혹은 사용자 아이디를 제공해주세요."
      );
    if (!verificationCode)
      throw new BadRequestError("인증 코드를 작성해주세요.");

    const user = await findUserByIdentifier(email, phone, userId);

    if (!user) {
      throw new NotFoundError("조건에 맞는 유저가 없습니다.");
    }

    // 사용자가 입력한 인증 코드와 저장된 인증 코드가 일치하는지 확인
    const isVerified = await verficationService.verifyVerificationCode(
      user.userId,
      verificationCode
    );

    // 인증 코드 일치 여부 확인
    if (isVerified) {
      return res
        .status(200)
        .json({ success: true, message: "인증 코드가 확인되었습니다." });
    } else {
      throw new UnauthorizedError(
        "입력하신 정보가 잘못되었습니다. 다시 시도해주세요.",
        "VERIFICATION_CODE_MISMATCH"
      );
    }
  }
);

export { requestLoginVerificationCode, checkLoginVerificationCode };
