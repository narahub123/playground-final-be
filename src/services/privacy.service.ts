import { InternalServerError, NotFoundError } from "@errors";
import { privacyRepository } from "@repositories";
import { IPrivacy, IPrivacyDto } from "@types";
import { Types, UpdateResult } from "mongoose";

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

  async updateMyPrivacy(userId: Types.ObjectId, body: IPrivacyDto) {
    const { replyOption } = body;

    let result: UpdateResult | undefined;
    
    if (replyOption) {
      result = await privacyRepository.updateReplyOption(userId, replyOption);
    }

    if (!result || result.modifiedCount === 0) {
      throw new InternalServerError(
        "개인 정보 수정 중 에러 발생",
        "PRIVACY_UPDATE_FAILED",
        {
          body,
        }
      );
    }

    if (result.matchedCount === 0) {
      throw new NotFoundError("사용자 조회 실패");
    }
  }
}

export default new PrivacyService();
