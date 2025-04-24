import { Privacy } from "@models";
import { IPrivacy } from "@types";
import { mongoDBErrorHandler } from "@utils";
import mongoose, { Types } from "mongoose";

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
}

export default new PrivacyRepository();
