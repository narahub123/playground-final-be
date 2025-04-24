import { LoginFailure } from "@models";
import { ILoginFailure, ILoginFailureInput } from "@types";
import { mongoDBErrorHandler } from "@utils";
import { UpdateWriteOpResult } from "mongoose";
import { Types } from "mongoose";

class LoginFailureRepository {
  /**
   * 로그인 실패 정보를 생성하는 함수입니다.
   *
   * @param {ILoginFailureInput} loginFailure 로그인 실패에 대한 입력 데이터입니다.
   * @returns {Promise<ILoginFailure | undefined>} 생성된 로그인 실패 정보 객체를 반환합니다.
   *          실패 시에는 undefined를 반환합니다.
   * @throws {Error} MongoDB 처리 중 발생하는 예외를 처리합니다.
   */
  async createLoginFailure(
    loginFailure: ILoginFailureInput
  ): Promise<ILoginFailure | undefined> {
    try {
      // 로그인 실패 정보 객체 생성
      const newFailure = LoginFailure.create(loginFailure);

      // 생성된 객체 반환
      return newFailure;
    } catch (error) {
      // 에러 발생 시, 에러 처리 핸들러 호출
      mongoDBErrorHandler("createLoginFailure", error, loginFailure);

      // 실패 시 undefined 반환 (명시적으로 반환)
      return undefined;
    }
  }

  /**
   * 특정 사용자(userId)의 로그인 실패 기록을 조회하는 함수입니다.
   *
   * @param {string} userId 사용자 ID로, 해당 사용자의 로그인 실패 기록을 찾습니다.
   * @returns {Promise<ILoginFailure[]>} 주어진 사용자 ID에 해당하는 로그인 실패 기록 배열을 반환합니다.
   *          로그인 실패 기록이 없으면 빈 배열을 반환합니다.
   * @throws {Error} MongoDB 처리 중 발생하는 예외를 처리합니다.
   */
  async getLoginFailuresByUserId(
    userId: Types.ObjectId
  ): Promise<ILoginFailure[]> {
    try {
      // 사용자 ID에 해당하는 로그인 실패 기록을 조회
      const loginFailures = await LoginFailure.find({ userId });

      // 로그인 실패 기록 반환 (빈 배열은 find()에서 자동으로 처리됨)
      return loginFailures;
    } catch (error) {
      // 에러 발생 시, 에러 처리 핸들러 호출
      mongoDBErrorHandler("getLoginFailuresByUserId", error, { userId });

      // 실패 시 빈 배열 반환
      return [];
    }
  }

  /**
   * 주어진 로그인 실패 기록들의 failureType을 "BruteForce"로 업데이트하는 함수입니다.
   *
   * @param {Types.ObjectId[]} failureIds 업데이트할 로그인 실패 기록들의 ObjectId 배열입니다.
   * @returns {Promise<UpdateWriteOpResult | undefined>} 업데이트 결과를 반환합니다.
   *          `UpdateWriteOpResult`는 업데이트된 문서의 수와 관련된 정보를 포함하며,
   *          다음과 같은 속성을 가집니다:
   *          - `acknowledged`: 업데이트가 성공적으로 처리되었는지 여부 (boolean)
   *          - `matchedCount`: 조건에 맞는 문서의 수
   *          - `modifiedCount`: 수정된 문서의 수
   *          - `upsertedCount`: `upsert` 작업이 있었을 경우 삽입된 문서의 수
   *          - `upsertedId`: 삽입된 문서의 `_id` (upsert가 없는 경우 `null`)
   * @throws {Error} MongoDB 처리 중 발생하는 예외를 처리합니다.
   *                 예를 들어, DB 연결 문제나 쿼리 오류 등으로 인해 발생할 수 있습니다.
   */
  async updateFailureTypeToBruteForce(
    failureIds: Types.ObjectId[]
  ): Promise<UpdateWriteOpResult | undefined> {
    try {
      // 로그인 실패 기록들의 failureType을 "BruteForce"로 업데이트
      return await LoginFailure.updateMany(
        { _id: { $in: failureIds } },
        { $set: { failureType: "BruteForce" } }
      );
    } catch (error) {
      // 에러 발생 시, 에러 처리 핸들러 호출
      mongoDBErrorHandler("updateFailureTypeToBruteForce", error, {
        failureIds,
      });
      // 실패 시 undefined 반환 (명시적으로 반환)
      return undefined;
    }
  }

  /**
   * 로그인 실패 기록들을 삭제하는 메서드.
   * 주어진 실패 기록 ID 배열을 사용하여 해당 로그인 실패 기록들을 삭제한다.
   *
   * @param {Types.ObjectId[]} failureIds 삭제할 로그인 실패 기록의 ID 배열
   *
   * @returns {Promise<any>} 삭제된 문서에 대한 결과
   * - `deleteMany` 메서드는 삭제된 문서 수와 관련된 결과를 반환한다.
   *
   * @throws {CustomAPIError} 데이터베이스 오류가 발생하면 적절한 에러를 던진다.
   */
  async deleteLoginFailuresByIds(failureIds: Types.ObjectId[]) {
    try {
      // 로그인 실패 기록을 삭제
      return await LoginFailure.deleteMany({ _id: { $in: failureIds } });
    } catch (error) {
      // 데이터베이스 오류 핸들링
      mongoDBErrorHandler("deleteLoginFailuresByIds", error, { failureIds });
    }
  }
}

export default new LoginFailureRepository();
