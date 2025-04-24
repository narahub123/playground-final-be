import { NotFoundError } from "@errors";
import { privacyRepository } from "@repositories";
import { IPrivacy } from "@types";
import { Types } from "mongoose";

class PrivacyService {
  async getPrivacyByUserId(userId: Types.ObjectId): Promise<IPrivacy> {
    const privacy = await privacyRepository.getPrivacyByUserId(userId);

    if (privacy === null) {
      throw new NotFoundError(
        "Privacy not found. (개인 정보 조회 실패)",
        "NOT_FOUND",
        {
          privacy: "PRIVACY_NOT_FOUND",
        }
      );
    }

    return privacy;
  }
}

export default new PrivacyService();
