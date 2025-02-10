import { verificationRepository } from "@repositories";
import { generateAuthCode } from "@utils";
import { sendEmail } from "./email.service";
import { verficationService } from "@services";
import { GoneError } from "@errors";

class VerificationService {
  async deleteExistingVerificationCode(userId: string) {
    const verification = await verificationRepository.getVerificationByUserId(
      userId
    );

    if (verification) {
      await verificationRepository.deleteVerificationById(verification._id);
    }
  }

  async sendVerificationCode(email: string, userId: string) {
    // 새로운 인증 코드 생성
    const verificationCode = generateAuthCode();

    // 인증 코드 이메일 제목 및 내용 설정
    const subject = "인증코드";
    const html = `<p>인증코드 ${verificationCode}</p>`;

    // 인증 코드 이메일 전송
    await sendEmail(email, subject, html);

    // 인증 코드와 사용자 정보를 인증 관련 모델에 저장
    await verificationRepository.createVerification({
      userId,
      verificationCode,
    });
  }

  async verifyVerificationCode(
    userId: string,
    verificationCode: string
  ): Promise<boolean> {
    // 인증코드 가져오기
    const verification = await verificationRepository.getVerificationByUserId(
      userId
    );

    // 인증 코드 만료 확인
    if (!verification) {
      throw new GoneError(
        "인증코드가 만료되었습니다. 인증 코드를 다시 요청해주세요.",
        "VERIFICATION_CODE_EXPIRED"
      );
    }

    return verificationCode === verification.verificationCode;
  }
}

export default new VerificationService();
