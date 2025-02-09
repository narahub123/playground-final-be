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
  getUserByPhone,
  getUserByUserId,
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

    // 사용자 조회를 위한 검색 방식 정의
    const fetchUserMethods = [
      { key: email, fetch: getUserByEmail },
      { key: phone, fetch: getUserByPhone },
      { key: userId, fetch: getUserByUserId },
    ];

    // 사용자 조회 및 인증 코드 확인
    for (const { key, fetch } of fetchUserMethods) {
      if (key) {
        const user = await fetch(key);
        if (user) {
          const sentCode = await getVerificationCodeByUserId(user.userId);

          // 인증 코드 만료 확인
          if (!sentCode) {
            throw new CustomAPIError(
              "인증코드가 만료되었습니다. 인증 코드를 다시 요청해주세요.",
              410,
              "GONE"
            );
          }

          // 인증 코드 일치 여부 확인
          if (verificationCode === sentCode?.verificationCode) {
            return res
              .status(200)
              .json({ success: true, message: "인증 코드가 확인되었습니다." });
          } else {
            throw new UnauthorizedError(
              "입력하신 정보가 잘못되었습니다. 다시 시도해주세요."
            );
          }
        }
      }
    }

    // 사용자를 찾지 못한 경우 예외 발생
    throw new NotFoundError("조건에 맞는 인증 코드를 찾을 수 없습니다.");
  }
);

export { requestLoginVerificationCode, checkLoginVerificationCode };
