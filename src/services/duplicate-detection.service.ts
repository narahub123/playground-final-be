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

  /**
   * 사용자 아이디 중복 여부를 확인하는 함수
   * @param {string} userId - 중복 여부를 확인할 사용자 아이디
   * @returns {Promise<boolean>} - 사용자 아이디가 중복되면 true, 그렇지 않으면 false를 반환
   */
  async isUserIdDuplicate(userId: string): Promise<boolean> {
    // 사용자 아이디로 유저를 조회합니다.
    const user = await userRepository.getUserByUserId(userId);

    // 유저가 존재하면 중복된 아이디, 존재하지 않으면 중복되지 않은 아이디로 판단
    return user ? true : false;
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
