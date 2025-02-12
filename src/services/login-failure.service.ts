import { LoginFailure } from "@models";
import {
  ConflictError,
  CustomAPIError,
  ForbiddenError,
  InternalServerError,
  MongoDBCastError,
  MongoDBDuplicateKeyError,
  MongoDBNetworkError,
  MongoDBTimeoutError,
  MongoDBValidationError,
} from "@errors";
import { ILoginFailureInput } from "@types";
import { Types } from "mongoose";
import { loginFailureRepository } from "@repositories";
import {
  ACCOUNT_LOCK_THRESHOLD,
  BRUTE_FORCE_THRESHOLD,
  LOGIN_FAILURE_TIME_WINDOW_MS,
} from "@constants";
import userService from "./user.service";

class LoginFailureService {
  /**
   * 주어진 사용자에 대해 특정 시간 내에 실패한 로그인 기록들의 _id를 반환합니다.
   *
   * 이 메서드는 사용자의 로그인 실패 기록을 가져와, 특정 시간 내에 발생한 로그인 실패들을 필터링하고,
   * 그 실패들의 _id 배열을 반환합니다.
   *
   * @param {string} userId - 로그인 실패 기록을 확인할 사용자 ID
   * @returns {Types.ObjectId[]} 특정 시간 내에 실패한 로그인 기록의 _id 배열
   */
  async getLoginFailureIdsInDuration(
    userId: string
  ): Promise<Types.ObjectId[]> {
    // 사용자의 로그인 실패 기록 가져오기
    const loginFailures = await loginFailureRepository.getLoginFailuresByUserId(
      userId
    );

    // 특정 시간 내에 실패한 로그인 기록을 필터링
    const failureCounterInDuration = loginFailures.filter(
      (failure) =>
        failure.failedAt.getTime() > Date.now() - LOGIN_FAILURE_TIME_WINDOW_MS
    );

    // 실패한 로그인 기록들의 _id 배열 반환
    const bruteForceIds = failureCounterInDuration.map(
      (failure) => failure._id
    );

    return bruteForceIds;
  }

  /**
   * 주어진 로그인 실패 기록들의 failureType을 "BruteForce"로 업데이트합니다.
   *
   * 이 메서드는 로그인 실패 기록들의 _id를 기반으로 실패 유형을 "BruteForce"로 업데이트하며,
   * 실패 유형을 변경하는 데 문제가 생기면 예외를 던집니다.
   *
   * @param {Types.ObjectId[]} bruteForceIds - "BruteForce"로 업데이트할 로그인 실패 기록들의 _id 배열
   * @throws {ForbiddenError} 로그인 실패 기록 업데이트 실패 시, 예외를 던집니다.
   */
  async updateFailureTypeToBruteForce(
    bruteForceIds: Types.ObjectId[]
  ): Promise<void> {
    // 로그인 실패 기록의 failureType을 "BruteForce"로 업데이트
    const result = await loginFailureRepository.updateFailureTypeToBruteForce(
      bruteForceIds
    );

    // 업데이트된 문서의 수가 예상된 수와 일치하지 않으면 예외 던짐
    if (result?.modifiedCount !== bruteForceIds.length) {
      throw new ForbiddenError(
        "An issue occurred while locking the account. (계정 처리 중 에러)",
        "LOCK_PROCESS_FAILED"
      );
    }
  }

  /**
   * 사용자의 로그인 실패 기록을 바탕으로, 일반 로그인 실패가 일정 횟수 이상인지 확인합니다.
   *
   * 이 메서드는 사용자의 로그인 실패 기록을 조회하고, "Normal" 실패 유형에 해당하는 로그인 실패 횟수가
   * 설정된 기준값 이상이면 true를 반환합니다.
   *
   * @param {string} userId - 로그인 실패 기록을 확인할 사용자 ID
   * @returns {Promise<boolean>} 일반 로그인 실패 횟수가 기준을 초과하면 true, 아니면 false
   */
  async isTooManyLoginFailures(userId: string): Promise<boolean> {
    // 사용자의 로그인 실패 기록 가져오기
    const loginFailures = await loginFailureRepository.getLoginFailuresByUserId(
      userId
    );

    // 일반 로그인 실패 횟수 계산
    const normalFailureCount = loginFailures.reduce(
      (count, failure) => count + (failure.failureType === "Normal" ? 1 : 0),
      0
    );

    // 실패 횟수가 기준을 초과하면 true 반환
    return normalFailureCount >= ACCOUNT_LOCK_THRESHOLD;
  }

  /**
   * 로그인 실패 기록을 처리하고, 해당 사용자 계정을 잠그는 메서드입니다.
   *
   * 이 메서드는 로그인 실패 기록을 저장하고, 특정 시간 내에 로그인 실패 횟수가 기준을 초과하면
   * "BruteForce" 공격으로 간주하여 실패 기록을 업데이트하고, 계정을 잠급니다.
   * 또한, 일반 로그인 실패 횟수가 기준을 초과하면 계정을 잠급니다.
   *
   * @param {ILoginFailureInput} loginFailure - 로그인 실패 정보 (사용자 ID와 실패 시각 등)
   * @throws {CustomAPIError} 로그인 실패 기록 저장 실패 시 예외 던짐
   * @throws {LockedError} 계정 잠금 처리 시 예외 던짐
   */
  async checkAndLockAccountOnFailure(
    loginFailure: ILoginFailureInput
  ): Promise<void> {
    // 로그인 실패 기록 저장
    const savedFailure = await loginFailureRepository.createLoginFailure(
      loginFailure
    );

    if (!savedFailure) {
      // 로그인 실패 기록 저장 실패 시, 예외 던짐
      throw new InternalServerError(
        "로그인 실패 기록 저장 실패",
        "LOGIN_FAILURE_UNSAVED"
      );
    }

    // 특정 시간 내에 발생한 실패한 로그인 기록의 _id 가져오기
    const bruteForceIds = await this.getLoginFailureIdsInDuration(
      loginFailure.userId
    );

    // 비정상적인 로그인 시도가 감지되었으면 BruteForce로 처리하고 계정 잠금
    if (bruteForceIds.length >= BRUTE_FORCE_THRESHOLD) {
      // 로그인 실패 기록을 BruteForce로 업데이트
      await this.updateFailureTypeToBruteForce(bruteForceIds);

      // 계정 잠금 처리
      await userService.lockAccount(
        loginFailure.userId,
        "BRUTE_FORCE_DETECTED"
      );
    }

    // 일반 로그인 실패 횟수가 기준을 초과했으면 계정 잠금
    const isTooManyLoginFailures = await this.isTooManyLoginFailures(
      loginFailure.userId
    );
    if (isTooManyLoginFailures) {
      await userService.lockAccount(
        loginFailure.userId,
        "TOO_MANY_LOGIN_FAILURES"
      );
    }
  }

  /**
   * 사용자의 일반 로그인 실패 기록을 삭제하는 메서드.
   * 주어진 사용자 ID에 대해 'Normal' 타입의 로그인 실패 기록을 모두 삭제한다.
   *
   * @param {string} userId 삭제할 로그인 실패 기록을 가진 사용자의 ID
   *
   * @returns {Promise<void>} 삭제 작업을 완료한 후 아무 것도 반환하지 않음
   *
   * @throws {CustomAPIError} 데이터베이스 오류가 발생하면 적절한 에러를 던진다.
   */
  async clearNormalLoginFailures(userId: string): Promise<void> {
    // 주어진 사용자 ID에 대한 로그인 실패 기록 가져오기
    const loginFailures = await loginFailureRepository.getLoginFailuresByUserId(
      userId
    );

    // 'Normal' 타입의 로그인 실패 기록들만 필터링하여 _id 배열로 반환
    const normalIds = loginFailures
      .filter((failure) => failure.failureType === "Normal")
      .map((failure) => failure._id);

    // 'Normal' 타입의 로그인 실패 기록들을 삭제
    const response = await loginFailureRepository.deleteLoginFailuresByIds(
      normalIds
    );

    if (response?.deletedCount !== normalIds.length) {
      // 삭제된 수가 예상한 수와 다른 경우 처리
      throw new ConflictError(
        "Some login failures were not deleted. (일부 로그인 실패 기록이 삭제되지 않았습니다.)",
        "PARTIAL_DELETION_FAILED",
        {
          userId,
          expectedCount: normalIds.length,
          deletedCount: response?.deletedCount,
        }
      );
    }
  }
}

export default new LoginFailureService();
