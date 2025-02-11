import { userRepository } from "@repositories";
import { ConflictError } from "@errors";

class DuplicateDetectionService {
  /**
   * 주어진 이메일 주소가 이미 등록된 이메일인지 확인합니다.
   *
   * @param {string} email - 중복 여부를 확인할 이메일 주소입니다.
   * @returns {Promise<boolean>} - 이메일이 중복되면 `true`, 중복되지 않으면 `false`를 반환합니다.
   *
   */
  async isEmailDuplicate(email: string): Promise<boolean> {
    // 주어진 이메일로 사용자 조회
    const user = await userRepository.getUserByEmail(email);

    // 사용자 정보가 존재하면 이메일이 중복된 것임
    return user ? true : false; // 중복되면 true, 아니면 false
  }

  async checkUserIdDuplication(userId: string) {
    const user = await userRepository.getUserByUserId(userId);

    if (user)
      throw new ConflictError(
        "이미 등록된 사용자 아이디입니다.",
        "USERID_DUPLICATION"
      );

    return false;
  }

  async checkPhoneDuplication(phone: string) {
    const user = await userRepository.getUserByPhone(phone);

    if (user)
      throw new ConflictError(
        "이미 등록된 사용자 아이디입니다.",
        "PHONE_DUPLICATION"
      );

    return false;
  }
}

export default new DuplicateDetectionService();
