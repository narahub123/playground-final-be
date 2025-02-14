import { Request, Response } from "express";
import { asyncWrapper } from "@middlewares";
import { BadRequestError, UnauthorizedError } from "@errors";
import { userService, verificationService } from "@services";
import { IApiSuccessResponse } from "@types";

/**
 * 사용자에게 로그인 인증 코드를 이메일 또는 휴대폰으로 전송하는 함수.
 * 이메일 또는 휴대폰 번호 중 하나가 제공되어야 하며, 인증 코드가 전송됩니다.
 *
 * @param {Request} req - 클라이언트로부터 요청받은 데이터 (이메일 또는 휴대폰 번호 포함)
 * @param {Response} res - 클라이언트로 응답을 보내기 위한 Response 객체
 *
 * @throws {BadRequestError} 이메일과 휴대폰 번호가 모두 제공되지 않은 경우
 * @throws {InternalServerError} 인증 코드 전송 또는 삭제 중 문제가 발생한 경우
 */
const requestLoginVerificationCode = asyncWrapper(
  "requestLoginVerificationCode",
  "Failed to send verification code. (인증 코드 전송 실패)",
  "VERIFICATION_CODE_SEND_FAILED", // 인증 코드 전송 실패
  async (req: Request, res: Response) => {
    const { email, phone } = req.body;

    // 이메일 또는 휴대폰 번호가 제공되지 않은 경우
    if (!email && !phone) {
      throw new BadRequestError(
        "At least one of email and phone is required. (이메일, 휴대전화번호 중 최소 하나는 필수)", // 에러 메시지
        "VALIDATION_ERROR",
        {
          email: "MISSING_EMAIL", // 에러 세부사항
          phone: "MISSING_PHONE", // 에러 세부사항
        }
      );
    }

    if (email) {
      // 이메일로 인증 코드 전송
      // 이메일을 통해 사용자 정보를 조회
      const user = await userService.findUserByIdentifier(email);

      // 해당 사용자에 대한 인증 코드 존재 유무를 확인하고 있다면 삭제
      await verificationService.deleteExistingVerificationCode(user.userId);

      // 새로운 인증 코드 생성하고 이메일로 전송하기
      await verificationService.sendVerificationCode(email, user.userId);
    } else {
      // 휴대폰 인증 코드 전송 부분 (아직 구현되지 않음)
      // SMS 전송 로직은 추후 구현 필요
    }

    const response: IApiSuccessResponse<{}> = {
      success: true,
      message: `Verification code sent successfully to the ${
        email ? "email" : "phone"
      }. (인증 코드가 ${
        email ? "이메일" : "휴대 전화"
      }로 성공적으로 전송되었습니다.)`,
      code: "VERIFICATION_CODE_SENT",
      timestamp: new Date().toISOString(),
      data: {
        email,
        phone,
      },
    };

    // 인증 코드 요청 성공 응답
    res.status(200).json(response);
  }
);

// 인증 코드 확인 핸들러
const checkLoginVerificationCode = asyncWrapper(
  "checkLoginVerificationCode",
  "Verification code verification failed (인증 코드 인증 실패)",
  "VERIFICATION_CODE_VERIFICATION_FAILED", // 인증 코드 인증 실패
  async (req: Request, res: Response) => {
    const { email, phone, userId, verificationCode } = req.body;

    // 이메일, 휴대 전화 번호, 사용자 아이디 중 하나라도 없으면 BadRequestError 발생
    if (!userId && !email && !phone) {
      throw new BadRequestError(
        "At least one of email, phone, and userId is required. (이메일, 휴대전화번호, 사용자 아이디 중 최소 하나는 필수)", // 에러 메시지
        "VALIDATION_ERROR",
        {
          email: "MISSING_EMAIL", // 에러 세부사항
          phone: "MISSING_PHONE", // 에러 세부사항
          userId: "MISSING_USERID", // 에러 세부사항
        }
      );
    }
    if (!verificationCode) {
      throw new BadRequestError(
        "verification code is required. (인증 코드 필수)", // 에러 메시지
        "VALIDATION_ERROR",
        {
          verification_code: "MISSING_VERIFICATION_CODE", // 에러 코드
        }
      );
    }

    const user = await userService.findUserByIdentifier(email, phone, userId);

    // 사용자가 입력한 인증 코드와 저장된 인증 코드가 일치하는지 확인
    const isVerified = await verificationService.verifyVerificationCode(
      user.userId,
      verificationCode
    );

    // 인증 코드 일치 여부 확인
    if (isVerified) {
      const response: IApiSuccessResponse = {
        success: true,
        message:
          "Verification code successfully verified. (인증 코드 인증 성공)",
        code: "VERIFICATION_CODE_VERIFIED", // 인증 코드가 인증 성공한 경우의 응답 코드
        timestamp: new Date().toISOString(),
      };
      return res.status(200).json(response);
    } else {
      throw new UnauthorizedError(
        "The verification code is incorrect. (인증 코드 인증 코드 불일치)",
        "VERIFICATION_ERROR",
        {
          verification_code: "VERIFICATION_CODE_MISMATCH",
        }
      );
    }
  }
);

export { requestLoginVerificationCode, checkLoginVerificationCode };
