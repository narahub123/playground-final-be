import { Verification } from "@models";
import { IVerification, IVerificationInput } from "@types";
import { mongoDBErrorHandler } from "@utils";
import { Types } from "mongoose";

class VerificationRepository {
  /**
   * 주어진 사용자 ID에 대한 인증 코드 조회
   *
   * @param userId - 인증 코드를 조회할 사용자 ID
   * @returns {Promise<IVerification | null>} - 사용자의 인증 코드 또는 없으면 null 반환
   * @throws {Error} - MongoDB 쿼리 오류 발생 시 처리
   */
  async getVerificationByUserId(userId: string): Promise<IVerification | null> {
    try {
      const verification = await Verification.findOne({ userId });
      return verification;
    } catch (error: any) {
      mongoDBErrorHandler("getVerificationCodeByUserId", error, { userId });
      return null;
    }
  }

  /**
   * 주어진 인증 코드 ID를 기준으로 인증 코드 삭제
   *
   * @param id - 삭제할 인증 코드의 ObjectId
   * @returns {Promise<IVerification | null>} - 삭제된 인증 코드 또는 실패 시 null 반환
   * @throws {Error} - MongoDB 쿼리 오류 발생 시 처리
   */
  async deleteVerificationById(
    id: Types.ObjectId
  ): Promise<IVerification | null> {
    try {
      const verification = await Verification.findByIdAndDelete({ _id: id });
      return verification;
    } catch (error: any) {
      mongoDBErrorHandler("deleteVerificationById", error, { id });
      return null;
    }
  }

  /**
   * 새로운 인증 코드 생성
   *
   * @param verification - 생성할 인증 코드 데이터
   * @returns {Promise<IVerification | undefined>} - 생성된 인증 코드 또는 실패 시 undefined 반환
   * @throws {Error} - MongoDB 쿼리 오류 발생 시 처리
   */
  async createVerification(
    verification: IVerificationInput
  ): Promise<IVerification | undefined> {
    try {
      const newVerification = await Verification.create(verification);

      return newVerification;
    } catch (error) {
      mongoDBErrorHandler("createVerification", error, { verification });
      return undefined;
    }
  }
}

export default new VerificationRepository();
