import { LockedError } from "@errors";
import { ILockStatus, LockReasonType } from "@types";

/**
 * 계정 잠금 상태를 확인하고, 잠금 상태일 경우 해당 사유에 맞는 예외를 던지는 함수입니다.
 *
 * @param {ILockStatus} lockStatus 계정 잠금 상태를 나타내는 객체입니다.
 * @throws {LockedError} 계정이 잠겨있고, 잠금 사유가 존재하는 경우, 해당 잠금 사유에 맞는 메시지와 함께 예외를 던집니다.
 *
 * @example
 * const lockStatus = {
 *   isLocked: true,
 *   lockReason: "BRUTE_FORCE_DETECTED",
 *   lockedAt: "2025-02-09T12:00:00Z"
 * };
 * verifyAccountLock(lockStatus);
 * // LockedError가 던져지며, 비정상적인 로그인 감지로 인한 메시지가 출력됩니다.
 */
const verifyAccountLock = (lockStatus: ILockStatus): void => {
  const { isLocked, lockReason, lockedAt } = lockStatus;

  // 잠금 사유별로 대응할 오류 메시지를 정의
  const errorMessages: Record<LockReasonType, string> = {
    BRUTE_FORCE_DETECTED: `비정상적인 로그인이 감지되어 잠긴 계정입니다. ${
      lockedAt ? new Date(lockedAt).toLocaleString() : ""
    }로그인 위해서는 관리자에게 문의해주세요.`,
    TOO_MANY_LOGIN_FAILURES: `로그인 시도 횟수를 초과하여 잠긴 계정입니다. 비밀번호 찾기 또는 관리자에게 문의하세요.`,
  };

  // 계정이 잠겨 있고, 잠금 사유가 존재하는 경우 예외를 던짐
  if (isLocked && lockReason) {
    throw new LockedError(errorMessages[lockReason], lockReason);
  }
};

export default verifyAccountLock;
