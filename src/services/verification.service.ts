import { verificationRepository } from "@repositories";
import { generateAuthCode } from "@utils";
import { sendEmail } from "./email.service";
import { GoneError, InternalServerError } from "@errors";

class VerificationService {
  /**
   * 주어진 userId에 대해 연결된 인증 코드가 있다면 삭제합니다.
   * 인증 코드가 없거나 삭제가 실패할 경우 에러를 던집니다.
   *
   * @param {string} userId - 인증 코드를 삭제할 사용자의 userId입니다.
   * @returns {Promise<void>} - 삭제가 성공하면 아무 값도 반환하지 않습니다.
   * 실패하거나 인증 코드가 없을 경우 InternalServerError가 발생합니다.
   *
   * @throws {InternalServerError} - 인증 코드 삭제에 실패한 경우 에러가 발생합니다.
   */
  async deleteExistingVerificationCode(userId: string): Promise<void> {
    // 주어진 userId로 인증 코드가 존재하는지 확인합니다.
    const verification = await verificationRepository.getVerificationByUserId(
      userId
    );

    // 인증 코드가 존재하면 삭제를 시도합니다.
    if (verification) {
      const deletedVerification =
        await verificationRepository.deleteVerificationById(verification._id);

      // 삭제가 실패하면 에러를 던집니다.
      if (!deletedVerification) {
        throw new InternalServerError(
          "Failed to delete verificationCode. (인증 코드 삭제 실패)", // 에러 메시지
          "FAILED_TO_DELETE_VERIFICATION_CODE", // 에러 코드
          { verificationId: verification._id } // 에러 세부 사항
        );
      }
    }
    // 인증 코드가 없다면 아무 작업도 하지 않습니다.
  }

  /**
   * 인증 코드를 생성하고 해당 코드를 이메일로 전송한 후, 인증 코드와 사용자 정보를 데이터베이스에 저장하는 함수입니다.
   *
   * @param {string} email - 인증 코드를 전송할 사용자의 이메일 주소.
   * @param {string} userId - 인증 코드를 받을 사용자의 고유 ID.
   * @throws {InternalServerError} 인증 코드 저장 실패 시, 서버 내부 오류를 던집니다.
   */
  async sendVerificationCode(email: string, userId: string) {
    // 새로운 인증 코드 생성
    const verificationCode = generateAuthCode();

    // 인증 코드 이메일 제목 및 내용 설정
    const subject = "인증코드";
    const html = `<p>인증코드 ${verificationCode}</p>`;

    // 인증 코드 이메일 전송
    await sendEmail(email, subject, html);

    // 인증 코드와 사용자 정보를 인증 관련 모델에 저장
    const verification = await verificationRepository.createVerification({
      userId,
      verificationCode,
    });

    // 인증 코드 저장이 실패한 경우, 서버 내부 오류를 던짐
    if (!verification) {
      throw new InternalServerError(
        "Failed to create verification code (인증 코드 저장 실패)",
        "FAILED_TO_CREATE_VERIFICATION_CODE"
      );
    }
  }

  /**
   * 사용자 인증 코드 검증을 수행하는 함수.
   * 주어진 userId와 인증 코드가 일치하는지 확인하고, 만료된 인증 코드에 대해서는 예외를 던집니다.
   *
   * @param {string} userId - 인증 코드가 저장된 사용자의 고유 ID
   * @param {string} verificationCode - 클라이언트가 제출한 인증 코드
   *
   * @returns {Promise<boolean>} 인증 코드가 일치하면 true, 아니면 false
   *
   * @throws {GoneError} 인증 코드가 만료된 경우 예외를 던집니다.
   */
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
      // 인증 코드가 존재하지 않으면 만료된 것으로 처리
      throw new GoneError(
        "인증코드가 만료되었습니다. 인증 코드를 다시 요청해주세요.", // 에러 메시지
        "VERIFICATION_CODE_EXPIRED", // 에러 코드
        {
          verification_code: "인증코드가 만료되었습니다.", // 세부 에러 설명
        }
      );
    }

    // 인증 코드가 일치하는지 비교
    return verificationCode === verification.verificationCode;
  }
}

export default new VerificationService();
