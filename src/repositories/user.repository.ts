import mongoose from "mongoose";
import { User } from "@models";
import { ILockStatus, IUser, IUserInput } from "@types";
import { mongoDBErrorHandler } from "@utils";
import { UpdateWriteOpResult } from "mongoose";

class UserRepository {
  /**
   * 주어진 이메일 주소로 사용자를 조회합니다.
   *
   * @param {string} email - 조회할 사용자의 이메일 주소입니다.
   * @returns {Promise<IUser | null>} - 이메일에 해당하는 사용자가 있으면 `IUser` 객체를 반환하고, 없으면 `null`을 반환합니다.
   *
   * @example
   * const user = await getUserByEmail('example@example.com');
   * if (user) {
   *   console.log("사용자 정보:", user);
   * } else {
   *   console.log("사용자를 찾을 수 없습니다.");
   * }
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      // 이메일로 사용자를 조회
      const user = await User.findOne({ email });

      // 사용자가 있으면 해당 사용자 반환, 없으면 null 반환
      return user;
    } catch (error: any) {
      // 에러 발생 시 오류 핸들러 호출
      mongoDBErrorHandler("getUserByEmail", error, { email });
      // 에러 처리 후 null 반환
      return null;
    }
  }

  /**
   * 사용자 아이디를 기준으로 사용자를 조회합니다.
   * @param userId - 사용자 아이디
   * @returns 사용자 정보 (IUser) 또는 null (사용자가 없으면 null)
   */
  async getUserByUserId(userId: string): Promise<IUser | null> {
    try {
      // 사용자 아이디를 기준으로 사용자 정보를 조회
      const user = await User.findOne({ userId });

      return user;
    } catch (error: any) {
      // 오류 발생 시 mongoDBErrorHandler로 에러를 처리하고 로그를 기록
      mongoDBErrorHandler("getUserByUserId", error, { userId });

      // 에러 처리 후 null 반환
      return null;
    }
  }

  /**
   * 전화번호를 기준으로 사용자를 조회합니다.
   * @param phone - 전화번호
   * @returns 사용자 정보 (IUser) 또는 null (사용자가 없으면 null)
   */
  async getUserByPhone(phone: string): Promise<IUser | null> {
    try {
      // 전화번호를 기준으로 사용자 정보를 조회
      const user = await User.findOne({ phone });

      return user;
    } catch (error: any) {
      // 오류 발생 시 mongoDBErrorHandler로 에러를 처리하고 로그를 기록
      mongoDBErrorHandler("getUserByPhone", error, { phone });

      // 에러 처리 후 null 반환
      return null;
    }
  }

  async createUser(
    user: IUserInput,
    options?: { session: mongoose.ClientSession }
  ): Promise<IUser | undefined> {
    try {
      const newUser = await User.create([user], options);

      return newUser[0] || undefined;
    } catch (error) {
      mongoDBErrorHandler("createUser", error, { user });
    }
  }
  /**
   * 주어진 사용자 ID에 대해 잠금 상태를 업데이트하는 함수입니다.
   *
   * @param {string} userId 업데이트할 사용자의 ID입니다.
   * @param {ILockStatus} lockStatus 사용자에 대한 잠금 상태입니다.
   * @returns {Promise<UpdateWriteOpResult | undefined>} 업데이트된 결과를 반환합니다.
   *          `UpdateWriteOpResult`는 업데이트된 문서의 수와 관련된 정보를 포함하며,
   *          다음과 같은 속성을 가집니다:
   *          - `acknowledged`: 업데이트가 성공적으로 처리되었는지 여부 (boolean)
   *          - `matchedCount`: 조건에 맞는 문서의 수
   *          - `modifiedCount`: 수정된 문서의 수
   * @throws {Error} MongoDB 처리 중 발생하는 예외를 처리합니다.
   */
  async updateLockStatus(
    userId: string,
    lockStatus: ILockStatus
  ): Promise<UpdateWriteOpResult | undefined> {
    try {
      const result = await User.updateOne({ userId }, { $set: { lockStatus } });

      // 업데이트 결과 반환
      return result;
    } catch (error) {
      // 에러 발생 시, 에러 처리 핸들러 호출
      mongoDBErrorHandler("updateLockStatus", error, { userId, lockStatus });
      // 실패 시 undefined 반환
      return undefined;
    }
  }
}

export default new UserRepository();
