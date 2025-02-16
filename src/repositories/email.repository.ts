import { Email } from "@models";
import { IEmail } from "@types";
import { mongoDBErrorHandler } from "@utils";

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
}

export default new EmailRepository();
