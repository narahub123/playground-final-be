import { userRepository } from "@repositories";
import { ConflictError } from "@errors";

class DuplicateDetection {
  async checkEmailDuplication(email: string) {
    const isDuplicate = await userRepository.getUserByEmail(email);

    if (isDuplicate)
      throw new ConflictError("이미 등록된 이메일입니다.", "EMAIL_DUPLICATION");

    return false;
  }

  async checkUserIdDuplication(userId: string) {
    const isDuplicate = await userRepository.getUserByUserId(userId);

    if (isDuplicate)
      throw new ConflictError(
        "이미 등록된 사용자 아이디입니다.",
        "USERID_DUPLICATION"
      );

    return false;
  }
}

export default new DuplicateDetection();
