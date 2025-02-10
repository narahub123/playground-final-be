import mongoose from "mongoose";
import { User } from "@models";
import { ILockStatus, IUser, IUserInput } from "@types";
import { mongoDBErrorHandler } from "@utils";
import { UpdateWriteOpResult } from "mongoose";

class UserRepository {
  async getUserByEmail(email: string): Promise<IUser | undefined> {
    try {
      const user = await User.findOne({ email });

      return user || undefined;
    } catch (error: any) {
      mongoDBErrorHandler("getUserByEmail", error, { email });
    }
  }
  async getUserByUserId(userId: string): Promise<IUser | undefined> {
    try {
      const user = await User.findOne({ userId });

      return user || undefined;
    } catch (error: any) {
      mongoDBErrorHandler("getUserByUserId", error, { userId });
    }
  }
  async getUserByPhone(phone: string): Promise<IUser | undefined> {
    try {
      const user = await User.findOne({ phone });

      return user || undefined;
    } catch (error: any) {
      mongoDBErrorHandler("getUserByPhone", error, { phone });
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
