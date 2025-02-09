import { Request, Response } from "express";
import { asyncWrapper } from "@middlewares";
import {
  BadRequestError,
  CustomAPIError,
  LockedError,
  NotFoundError,
  UnauthorizedError,
} from "@errors";
import {
  createVerification,
  deleteVerificationCode,
  getUserByEmail,
  getVerificationCodeByUserId,
  sendEmail,
} from "@services";
import { generateAuthCode } from "@utils";

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

      // 이미 전송된 인증 코드가 있는지 확인
      const sentVerificationCode = await getVerificationCodeByUserId(
        user.userId
      );

      if (sentVerificationCode) {
        // 기존 인증 코드가 있다면 삭제
        await deleteVerificationCode(sentVerificationCode._id);
      }

      // 새로운 인증 코드 생성
      const verificationCode = generateAuthCode();

      // 인증 코드 이메일 제목 및 내용 설정
      const subject = "인증코드";
      const html = `<p>인증코드 ${verificationCode}</p>`;

      // 인증 코드 이메일 전송
      await sendEmail(email, subject, html);

      // 인증 코드와 사용자 정보를 인증 관련 모델에 저장
      await createVerification({ userId: user.userId, verificationCode });
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

export { requestLoginVerificationCode };
