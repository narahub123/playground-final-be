import { Privacy } from "@models";
import { IPrivacy, ReplyOptionType } from "@types";
import { mongoDBErrorHandler } from "@utils";
import mongoose, { ClientSession, Types, UpdateResult } from "mongoose";

class PrivacyRepository {
  async createPrivacy(
    userId: Types.ObjectId,
    options?: { session: mongoose.ClientSession }
  ): Promise<IPrivacy | undefined> {
    try {
      const newPrivacy = await Privacy.create([{ userId }], options);

      return newPrivacy[0] || undefined;
    } catch (error) {
      mongoDBErrorHandler("createPrivacy", error, { userId });
    }
  }

  async getPrivacyByUserId(userId: Types.ObjectId): Promise<IPrivacy | null> {
    try {
      const privacy = await Privacy.findOne({ userId });

      return privacy;
    } catch (error) {
      mongoDBErrorHandler("createPrivacy", error, { userId });
      return null;
    }
  }

  async updateReplyOption(
    userId: Types.ObjectId,
    replyOption: ReplyOptionType
  ): Promise<UpdateResult | undefined> {
    try {
      const result = await Privacy.updateOne(
        { userId },
        { $set: { replyOption } }
      );

      return result;
    } catch (error) {
      mongoDBErrorHandler("updateReplyOption", error, { userId });
      return undefined;
    }
  }

  async addMutedUser(
    userId: Types.ObjectId,
    opponent: Types.ObjectId
  ): Promise<UpdateResult | undefined> {
    try {
      const result = await Privacy.updateOne(
        { userId },
        {
          $addToSet: { mutedUsers: opponent },
        }
      );

      return result;
    } catch (error) {
      mongoDBErrorHandler("addMutedUser", error, { userId, opponent });
      return undefined;
    }
  }

  async removeMutedUser(
    userId: Types.ObjectId,
    opponent: Types.ObjectId
  ): Promise<UpdateResult | undefined> {
    try {
      const result = await Privacy.updateOne(
        { userId },
        {
          $pull: { mutedUsers: opponent },
        }
      );

      return result;
    } catch (error) {
      mongoDBErrorHandler("removeMutedUser", error, { userId, opponent });
      return undefined;
    }
  }

  async addBlockedUser(
    userId: Types.ObjectId,
    opponent: Types.ObjectId
  ): Promise<UpdateResult | undefined> {
    try {
      const result = await Privacy.updateOne(
        { userId },
        {
          $addToSet: { blockedUsers: opponent },
        }
      );

      return result;
    } catch (error) {
      mongoDBErrorHandler("addBlockedUser", error, { userId, opponent });
      return undefined;
    }
  }

  async removeBlockedUser(
    userId: Types.ObjectId,
    opponent: Types.ObjectId
  ): Promise<UpdateResult | undefined> {
    try {
      const result = await Privacy.updateOne(
        { userId },
        {
          $pull: { blockedUsers: opponent },
        }
      );

      return result;
    } catch (error) {
      mongoDBErrorHandler("removeBlockedUser", error, { userId, opponent });
      return undefined;
    }
  }

  async toggleIsSensitiveMediaDisplayed(
    userId: Types.ObjectId,
    isSensitiveMediaDisplayed: boolean,
    session?: ClientSession
  ): Promise<UpdateResult | undefined> {
    try {
      const result = await Privacy.updateOne(
        {
          userId,
        },
        {
          isSensitiveMediaDisplayed: !isSensitiveMediaDisplayed,
        },
        { session }
      );

      return result;
    } catch (error) {
      mongoDBErrorHandler("toggleIsSensitiveMediaDisplayed", error, {
        userId,
        isSensitiveMediaDisplayed,
      });
      return undefined;
    }
  }

  async toggleIsMutesAndBlocksRemoved(
    userId: Types.ObjectId,
    isMutesAndBlocksRemoved: boolean,
    session?: ClientSession
  ): Promise<UpdateResult | undefined> {
    try {
      const result = await Privacy.updateOne(
        {
          userId,
        },
        {
          isMutesAndBlocksRemoved: !isMutesAndBlocksRemoved,
        },
        { session }
      );

      return result;
    } catch (error) {
      mongoDBErrorHandler("toggleIsMutesAndBlocksRemoved", error, {
        userId,
        isMutesAndBlocksRemoved,
      });

      return undefined;
    }
  }
}

export default new PrivacyRepository();
