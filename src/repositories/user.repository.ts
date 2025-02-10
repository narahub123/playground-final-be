import { User } from "@models";
import { IUser } from "@types";
import { mongoDBErrorHandler } from "@utils";

class UserRepository {
  async getUserByEmail(email: string): Promise<IUser | undefined> {
    try {
      const user = await User.findOne({ email });

      return user || undefined;
    } catch (error: any) {
      mongoDBErrorHandler("getUserByEmail", error, { email });
    }
  }
  async getUserByUserId(userId: string): Promise<IUser | undefined> {
    try {
      const user = await User.findOne({ userId });

      return user || undefined;
    } catch (error: any) {
      mongoDBErrorHandler("getUserByUserId", error, { userId });
    }
  }
  async getUserByPhone(phone: string): Promise<IUser | undefined> {
    try {
      const user = await User.findOne({ phone });

      return user || undefined;
    } catch (error: any) {
      mongoDBErrorHandler("getUserByPhone", error, { phone });
    }
  }
}

export default new UserRepository();
