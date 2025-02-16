import { Email } from "@models";
import { IEmail, IEmailInput } from "@types";
import { mongoDBErrorHandler } from "@utils";
import mongoose from "mongoose";

class EmailRepository {
  async getEmailInfoByAddress(email: string): Promise<IEmail | null> {
    try {
      // 이메일로 이메일 정보 조회
      const emailInfo = await Email.findOne({ email });

      // 이메일 정보가 있다면 해당 이메일 정보 반환, 없으면 null 반환
      return emailInfo;
    } catch (error: any) {
      // 에러 발생 시 오류 핸들러 호출
      mongoDBErrorHandler("getEmailInfoByAddress", error, { email });
      // 에러 처리 후 null 반환
      return null;
    }
  }

  async createEmail(
    email: IEmailInput,
    options?: { session?: mongoose.ClientSession }
  ): Promise<IEmail | undefined> {
    try {
      const newEmail = await Email.create([email], options);

      return newEmail[0] || undefined;
    } catch (error) {
      // 에러 발생 시 오류 핸들러 호출
      mongoDBErrorHandler("getEmailInfoByAddress", error, { email });
      // 에러 처리 후 null 반환
      return undefined;
    }
  }

  /**
   * 주어진 사용자 ID를 기반으로 이메일 목록을 조회하는 함수.
   *
   * @param {string} userId - 이메일 정보를 조회할 사용자 ID.
   * @returns {Promise<IEmail[]>} - 조회된 이메일 배열 (조회 실패 시 빈 배열 반환).
   */
  async getEamilsByUserId(userId: string): Promise<IEmail[]> {
    try {
      // userId를 기준으로 이메일 목록 조회
      const emails = await Email.find({ userId });
      return emails;
    } catch (error) {
      // 에러 발생 시 오류 핸들러 호출
      mongoDBErrorHandler("getEamilsByUserId", error, { userId });

      // 에러 처리 후 빈 배열 반환
      return [];
    }
  }
}

export default new EmailRepository();
