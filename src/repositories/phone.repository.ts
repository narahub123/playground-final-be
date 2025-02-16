import { Phone } from "@models";
import { IPhone } from "@types";
import { mongoDBErrorHandler } from "@utils";

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
}

export default new PhoneRepository();
