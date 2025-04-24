import { InternalServerError, NotFoundError } from "@errors";
import { privacyRepository } from "@repositories";
import { IPrivacy, IPrivacyDto, ReplyOptionType } from "@types";
import mongoose, { Types, UpdateResult } from "mongoose";

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

  async updateReplyOption(
    userId: Types.ObjectId,
    replyOption: ReplyOptionType
  ) {
    const result = await privacyRepository.updateReplyOption(
      userId,
      replyOption
    );

    if (!result || result.modifiedCount === 0) {
      throw new InternalServerError(
        "댓글 설정 수정 중 에러 발생",
        "PRIVACY_UPDATE_FAILED",
        {
          userId,
          replyOption,
        }
      );
    }

    if (result.matchedCount === 0) {
      throw new NotFoundError("사용자 조회 실패");
    }
  }

  async isMuting(
    userId: Types.ObjectId,
    mutedUser: Types.ObjectId
  ): Promise<boolean> {
    const privacy = await this.getPrivacyByUserId(userId);

    const mutedUsers = privacy.mutedUsers;

    return mutedUsers.some((m) => m.equals(mutedUser));
  }

  async updateMutedUser(userId: Types.ObjectId, opponent: Types.ObjectId) {
    const isMuting = await this.isMuting(userId, opponent);

    const result = isMuting
      ? await privacyRepository.removeMutedUser(userId, opponent)
      : await privacyRepository.addMutedUser(userId, opponent);

    if (!result || result.modifiedCount === 0) {
      throw new InternalServerError(
        "뮤트 수정 중 에러 발생",
        "PRIVACY_UPDATE_FAILED",
        {
          userId,
          opponent,
        }
      );
    }

    if (result.matchedCount === 0) {
      throw new NotFoundError("사용자 조회 실패");
    }
  }

  async updateMyPrivacy(userId: Types.ObjectId, body: IPrivacyDto) {
    const { replyOption, mutedUser } = body;

    if (replyOption) {
      await this.updateReplyOption(userId, replyOption);
    }

    if (mutedUser) {
      const opponent = new mongoose.Types.ObjectId(mutedUser);

      await this.updateMutedUser(userId, opponent);
    }
  }
}

export default new PrivacyService();
