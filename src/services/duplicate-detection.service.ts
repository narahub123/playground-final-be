import { userRepository } from "@repositories";
import { ConflictError } from "@errors";

class DuplicateDetection {
  async checkEmailDuplication(email: string) {
    const isDuplicate = await userRepository.getUserByEmail(email);

    if (isDuplicate)
      throw new ConflictError("이미 등록된 이메일입니다.", "EMAIL_DUPLICATION");

    return false;
  }
}

export default new DuplicateDetection();
