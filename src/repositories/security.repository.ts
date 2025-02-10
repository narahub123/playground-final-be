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
}

export default new SecurityRepository();
