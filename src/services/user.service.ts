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
        "USER_NOT_FOUND", // 에러 코드
        {}
      );
    }

    return user;
  }

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

  async lockAccount(userId: string, lockReason: LockReasonType) {
    const errorMessages: Record<LockReasonType, string> = {
      BRUTE_FORCE_DETECTED:
        "비정상적인 로그인 시도가 감지되어 계정이 잠깁니다. 로그인을 위해서는 관리자에게 문의하세요.",

      TOO_MANY_LOGIN_FAILURES: `로그인 시도 횟수 ${ACCOUNT_LOCK_THRESHOLD}회가 되어서 계정이 잠겼습니다. 비밀번호 찾기 또는 관리자에게 문의하세요.`,
    };

    // 잠금 처리
    await userRepository.updateLockStatus(userId, {
      isLocked: true,
      lockReason,
      lockedAt: new Date(),
    });

    throw new LockedError(errorMessages[lockReason], lockReason);
  }
}

export default new UserService();
