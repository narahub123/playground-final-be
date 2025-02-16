import { LockedError, NotFoundError } from "@errors";
import { IUser, LockReasonType } from "@types";
import { emailRepository, userRepository } from "@repositories";

class UserService {
  /**
   * 이메일을 통해 해당 사용자 정보를 조회하는 함수.
   * 이메일에 해당하는 정보를 먼저 가져오고, 그 정보를 바탕으로 사용자를 조회합니다.
   *
   * @param {string} email - 조회할 사용자의 이메일 주소.
   * @returns {Promise<IUser | null>} - 사용자 정보 (`IUser` 인터페이스)에 해당하는 데이터를 반환하거나,
   *                                    사용자를 찾을 수 없으면 `null`을 반환.
   * @throws {NotFoundError} - 이메일 정보가 존재하지 않는 경우, `NotFoundError`를 던집니다.
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    // 이메일을 통해 이메일 정보를 조회
    const emailInfo = await emailRepository.getEmailInfoByAddress(email);

    // 이메일 정보가 존재하지 않는 경우, 예외를 던짐
    if (!emailInfo) {
      throw new NotFoundError(
        "Email info is not Found (이메일 정보 조회 실패)",
        "NOT_FOUND",
        {
          email: "EMAIL_INFO_NOT_FOUND", // 오류 세부 정보
        }
      );
    }

    // 이메일 정보를 바탕으로 사용자를 조회
    const user = await userRepository.getUserByUserId(emailInfo.email);

    // 사용자 정보 반환
    return user;
  }

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
      user = await this.getUserByEmail(email);
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
