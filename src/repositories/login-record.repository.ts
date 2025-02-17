import { LoginRecord } from "@models";
import { ILoginRecord, ILoginRecordInput, ILogoutInfo } from "@types";
import { mongoDBErrorHandler } from "@utils";
import { UpdateResult } from "mongoose";

class LoginRecordRepository {
  /**
   * 특정 사용자의 로그인 기록을 가져오는 메서드입니다.
   *
   * @param {string} userId - 로그인 기록을 조회할 사용자의 ID.
   * @returns {Promise<ILoginRecord[]>} - 사용자의 로그인 기록 배열. 오류 발생 시 빈 배열을 반환.
   */
  async getLoginRecordsByUserId(userId: string): Promise<ILoginRecord[]> {
    try {
      // userId로 로그인 기록 검색
      const loginRecords = await LoginRecord.find({ userId });

      return loginRecords;
    } catch (error) {
      // DB 관련 오류 처리
      mongoDBErrorHandler("getLoginRecordsByUserId", error, { userId });
      return [];
    }
  }

  /**
   * 새로운 로그인 기록을 생성하는 메서드입니다.
   *
   * @param {ILoginRecordInput} loginRecord - 생성할 로그인 기록에 대한 정보.
   * @returns {Promise<ILoginRecord | undefined>} - 생성된 로그인 기록 객체 또는 오류 발생 시 `undefined`.
   */
  async createLoginRecord(
    loginRecord: ILoginRecordInput
  ): Promise<ILoginRecord | undefined> {
    try {
      // 로그인 기록 생성
      const login = await LoginRecord.create(loginRecord);

      return login;
    } catch (error) {
      // DB 관련 오류 처리
      mongoDBErrorHandler("createLoginRecord", error, loginRecord);
    }
  }

  // loginRecord 업데이트
  async updateLogoutInfo(
    refreshToken: string,
    logoutInfo: ILogoutInfo
  ): Promise<UpdateResult | undefined> {
    try {
      const loginRecord = await LoginRecord.updateOne(
        {
          refreshToken,
          logoutInfo: { $exists: false },
        },
        { $set: { logoutInfo } }
      );

      return loginRecord;
    } catch (error) {
      mongoDBErrorHandler("createLoginRecord", error, {
        refreshToken,
        logoutInfo,
      });
    }
  }
}

export default new LoginRecordRepository();
