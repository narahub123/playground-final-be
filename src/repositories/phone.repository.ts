import { Phone } from "@models";
import { IPhone, IPhoneInput } from "@types";
import { mongoDBErrorHandler } from "@utils";
import mongoose from "mongoose";

class PhoneRepository {
  /**
   * 주어진 전화번호를 통해 해당 전화번호 정보를 조회하는 함수.
   *
   * @param {string} phone - 조회할 전화번호.
   * @returns {Promise<IPhone | null>} - 전화번호 정보 (`IPhone` 인터페이스)에 해당하는 데이터를 반환하거나,
   *                                      전화번호 정보를 찾을 수 없으면 `null`을 반환.
   * @throws {Error} - 데이터베이스 조회 중 발생한 오류는 핸들러에 의해 처리됩니다.
   */
  async getPhoneInfoByPhone(phone: string): Promise<IPhone | null> {
    try {
      // 주어진 전화번호를 기준으로 전화번호 정보 조회
      const phoneInfo = await Phone.findOne({ phone });

      // 조회된 전화번호 정보 반환
      return phoneInfo;
    } catch (error) {
      // 에러 발생 시, 오류 핸들러 호출 (전화번호 관련 정보로 에러 로그 작성)
      mongoDBErrorHandler("getPhoneInfoByPhone", error, { phone });

      // 오류 발생 후 null 반환
      return null;
    }
  }

  /**
   * 새로운 전화번호 정보를 데이터베이스에 생성하는 함수.
   *
   * @param {IPhoneInput} phone - 생성할 전화번호 정보 객체. `IPhoneInput` 인터페이스에 맞는 데이터를 받아옴.
   * @param {Object} [options] - 옵션 객체. `session`을 포함할 수 있으며, 트랜잭션 처리를 위한 세션 정보.
   * @param {mongoose.ClientSession} [options.session] - Mongoose 세션을 사용하는 경우에만 제공. 트랜잭션 내에서 데이터베이스 작업을 수행할 수 있음.
   * @returns {Promise<IPhone | undefined>} - 생성된 전화번호 정보 (`IPhone` 인터페이스)에 해당하는 데이터를 반환하거나,
   *                                          오류가 발생하면 `undefined`를 반환.
   * @throws {Error} - 데이터베이스 작업 중 발생한 오류는 핸들러에 의해 처리됩니다.
   */
  async createPhone(
    phone: IPhoneInput,
    options?: { session?: mongoose.ClientSession }
  ): Promise<IPhone | undefined> {
    try {
      // 전화번호 정보 생성
      const phoneInfo = await Phone.create([phone], options);

      // 생성된 전화번호 정보 반환 (배열이므로 첫 번째 항목 반환)
      return phoneInfo[0] || undefined;
    } catch (error: any) {
      // 에러 발생 시, 오류 핸들러 호출 (전화번호 정보와 관련된 에러 로그 작성)
      mongoDBErrorHandler("getEmailInfoByAddress", error, { phone });

      // 오류 발생 후 undefined 반환
      return undefined;
    }
  }

  /**
   * 주어진 사용자 ID를 기반으로 전화번호 목록을 조회하는 함수.
   *
   * @param {string} userId - 전화번호 정보를 조회할 사용자 ID.
   * @returns {Promise<IPhone[]>} - 조회된 전화번호 배열 (조회 실패 시 빈 배열 반환).
   */
  async getPhonesByUserId(userId: string): Promise<IPhone[]> {
    try {
      // userId를 기준으로 전화번호 목록 조회
      const phones = await Phone.find({ userId });
      return phones;
    } catch (error) {
      // 에러 발생 시 오류 핸들러 호출 (함수명 수정)
      mongoDBErrorHandler("getPhonesByUserId", error, { userId });

      // 에러 처리 후 빈 배열 반환
      return [];
    }
  }
}

export default new PhoneRepository();
