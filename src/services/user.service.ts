import { LockedError, NotFoundError } from "@errors";
import {
  getUserByEmail,
  getUserByPhone,
  getUserByUserId,
} from "./user-finder.service";
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
  async findUserByIdentifier(
    email?: string,
    phone?: string,
    userId?: string
  ): Promise<IUser> {
    let user: IUser | undefined;

    if (email) {
      user = await getUserByEmail(email);
    } else if (phone) {
      user = await getUserByPhone(phone);
    } else if (userId) {
      user = await getUserByUserId(userId);
    }

    if (!user) {
      throw new NotFoundError("조건에 맞는 사용자를 찾을 수 없습니다.");
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
