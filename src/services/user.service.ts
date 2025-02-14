import { LockedError, NotFoundError } from "@errors";
import { INotificationInput, IUser, IUserInput, LockReasonType } from "@types";
import {
  displayRepository,
  notificationRepository,
  privacyRepository,
  securityRepository,
  userRepository,
} from "@repositories";
import mongoose from "mongoose";
import { ACCOUNT_LOCK_THRESHOLD } from "@constants";

class UserService {
  /**
   * 사용자 식별자 (이메일, 전화번호, 사용자 아이디)를 통해 사용자를 조회합니다.
   * @param email - 이메일 (선택적)
   * @param phone - 전화번호 (선택적)
   * @param userId - 사용자 아이디 (선택적)
   * @returns 사용자 정보 (IUser)
   * @throws NotFoundError - 사용자가 존재하지 않을 경우
   */
  async findUserByIdentifier(
    email?: string,
    phone?: string,
    userId?: string
  ): Promise<IUser> {
    let user: IUser | null = null;

    // 이메일을 통해 사용자를 조회
    if (email) {
      user = await userRepository.getUserByEmail(email);
    }
    // 전화번호를 통해 사용자를 조회
    else if (phone) {
      user = await userRepository.getUserByPhone(phone);
    }
    // 사용자 아이디를 통해 사용자를 조회
    else if (userId) {
      user = await userRepository.getUserByUserId(userId);
    }

    // 사용자가 없으면 NotFoundError 던짐
    if (!user) {
      throw new NotFoundError(
        "User is not found (사용자 조회 불가)", // 에러 메시지
        "NOT_FOUND", // 에러 코드
        {
          user: "USER_NOT_FOUND", // 에러 코드
        }
      );
    }

    return user;
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
    newNotification: INotificationInput,
    userId: string,
    session: mongoose.ClientSession
  ) {
    await userRepository.createUser(newUser, { session });
    await securityRepository.createSecurity(userId, { session });
    await notificationRepository.createNotification(newNotification, {
      session,
    });
    await displayRepository.createDisplay(userId, { session });
    await privacyRepository.createPrivacy(userId, { session });
  }

  /**
   * 사용자 계정을 잠급니다.
   * 로그인 시도가 비정상적으로 감지되었거나, 로그인 실패 횟수가 초과되었을 경우 계정을 잠급니다.
   *
   * @param userId - 잠금 처리를 할 사용자의 ID
   * @param lockReason - 계정을 잠그는 이유 (예: 비정상적인 로그인 시도, 로그인 실패 횟수 초과 등)
   * @throws {LockedError} 계정 잠금 이유에 해당하는 에러를 던집니다.
   */
  async lockAccount(userId: string, lockReason: LockReasonType) {
    // 계정 잠금 이유에 따른 에러 메시지를 설정
    const errorMessages: Record<LockReasonType, string> = {
      BRUTE_FORCE_DETECTED:
        "Abnormal login attempts detected, and the account has been locked. (비정상적인 로그인 시도로 인한 계정 잠금)",

      TOO_MANY_LOGIN_FAILURES:
        "The account has been locked due to excessive login attempts. (로그인 횟수 초과로 인한 계정 잠금)",
    };

    // 사용자 계정 잠금 처리
    await userRepository.updateLockStatus(userId, {
      isLocked: true, // 계정 잠금 상태로 설정
      lockReason, // 계정 잠금 사유 설정
      lockedAt: new Date(), // 계정 잠금 시간을 현재 시간으로 설정
    });

    // 잠금 처리 후, 해당 사유에 맞는 LockedError를 던짐
    throw new LockedError(errorMessages[lockReason], "ACCOUNT_LOCK", {
      lock: lockReason,
    });
  }
}

export default new UserService();
