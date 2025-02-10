import { Privacy } from "@models";
import { IPrivacy } from "@types";
import { mongoDBErrorHandler } from "@utils";
import mongoose from "mongoose";

class PrivacyRepository {
  async createPrivacy(
    userId: string,
    options?: { session: mongoose.ClientSession }
  ): Promise<IPrivacy | undefined> {
    try {
      const newPrivacy = await Privacy.create([{ userId }], options);

      return newPrivacy[0] || undefined;
    } catch (error) {
      mongoDBErrorHandler("createPrivacy", error, { userId });
    }
  }
}

export default new PrivacyRepository();
