import {
  IDevice,
  IDisplayInput,
  IEmailInput,
  ILocation,
  INotificationInput,
  IUserInput,
} from "@types";
import { comparePassword } from "@utils";
import loginFailureService from "./login-failure.service";
import { UnauthorizedError } from "@errors";
import mongoose from "mongoose";
import {
  displayRepository,
  emailRepository,
  notificationRepository,
  privacyRepository,
  securityRepository,
  userRepository,
} from "@repositories";

class AuthService {
  /**
   * 주어진 비밀번호를 검증하고, 비밀번호 불일치 시 로그인 실패 기록을 처리하고 계정을 잠금 처리합니다.
   *
   * 이 메서드는 사용자가 입력한 비밀번호와 저장된 비밀번호를 비교하고, 비밀번호가 일치하지 않으면
   * 로그인 실패 기록을 저장하고, 특정 조건에 따라 계정을 잠급니다.
   *
   * @param {string} password - 사용자가 입력한 비밀번호
   * @param {string} savedPassword - 저장된 비밀번호 (해시화된 비밀번호)
   * @param {string} userId - 사용자의 고유 ID
   * @param {IDevice} device - 로그인 시도에 사용된 디바이스 정보
   * @param {string} ip - 로그인 시도에 사용된 IP 주소
   * @param {ILocation} location - 로그인 시도에 사용된 위치 정보
   * @throws {UnauthorizedError} 비밀번호가 일치하지 않으면 예외를 던짐
   */
  async validatePasswordAndHandleLoginFailure(
    password: string,
    savedPassword: string,
    userId: string,
    device: IDevice,
    ip: string,
    location: ILocation
  ): Promise<void> {
    // 비밀번호 검증
    const isValid = await comparePassword(password, savedPassword);

    if (!isValid) {
      // 로그인 실패 기록을 저장하고, 계정 잠금 처리를 함
      await loginFailureService.checkAndLockAccountOnFailure({
        userId,
        device,
        ip,
        location,
      });

      // 비밀번호가 일치하지 않으면 UnauthorizedError 예외를 던짐
      throw new UnauthorizedError(
        "Incorrect password. (비밀번호 불일치)",
        "AUTHENTICATION_FAILED",
        {
          password: "PASSWORD_UNMATCHED",
        }
      );
    }
  }

  /**
   * 새 사용자의 데이터를 초기화하는 함수입니다. 이 함수는 사용자의 기본 정보, 보안 정보, 알림 설정,
   * 디스플레이 설정, 개인정보 설정 등을 데이터베이스에 저장합니다.
   * 모든 DB 작업은 트랜잭션 내에서 수행됩니다.
   *
   * @param newUser - 새 사용자 정보. 사용자의 기본 정보(이름, 이메일 등)가 포함된 객체.
   * @param newNotification - 새 사용자에 대한 알림 설정 정보.
   * @param userId - 새 사용자 고유 ID.
   * @param session - Mongoose 클라이언트 세션 객체. 트랜잭션을 관리하는데 사용됩니다.
   *
   * @throws Error - 트랜잭션 내에서 하나라도 실패할 경우 롤백됩니다. 이 함수 자체에서 오류를 처리하지 않으며,
   * 외부에서 트랜잭션을 처리하는 로직이 필요합니다.
   */
  async initializeUser(
    newUser: IUserInput,
    newEmail: IEmailInput,
    newNotification: INotificationInput,
    newDisplay: IDisplayInput,
    userId: string,
    session: mongoose.ClientSession
  ) {
    await userRepository.createUser(newUser, { session });
    await emailRepository.createEmail(newEmail, { session });
    await securityRepository.createSecurity(userId, { session });
    await notificationRepository.createNotification(newNotification, {
      session,
    });
    await displayRepository.createDisplay(newDisplay, { session });
    await privacyRepository.createPrivacy(userId, { session });
  }
}

export default new AuthService();
