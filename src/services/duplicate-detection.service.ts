import { userRepository } from "@repositories";
import { ConflictError } from "@errors";

class DuplicateDetectionService {
  async checkEmailDuplication(email: string) {
    const user = await userRepository.getUserByEmail(email);

    if (user)
      throw new ConflictError("이미 등록된 이메일입니다.", "EMAIL_DUPLICATION");

    return false;
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
