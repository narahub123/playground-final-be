import { Security } from "@models";
import { ISecurity } from "@types";
import { mongoDBErrorHandler } from "@utils";
import mongoose from "mongoose";

class SecurityRepository {
  async createSecurity(
    userId: string,
    options?: { session: mongoose.ClientSession }
  ): Promise<ISecurity | undefined> {
    try {
      const newSecurity = await Security.create([{ userId }], options);

      return newSecurity[0] || undefined;
    } catch (error) {
      mongoDBErrorHandler("createSecurity", error, { userId });
    }
  }

  async getSecurityByUserId(userId: string): Promise<ISecurity | null> {
    try {
      const security = await Security.findOne({ userId });

      return security;
    } catch (error) {
      mongoDBErrorHandler("createSecurity", error, { userId });
      return null;
    }
  }
}

export default new SecurityRepository();
