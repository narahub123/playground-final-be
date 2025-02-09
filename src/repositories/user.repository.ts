import { User } from "@models";
import { mongoDBErrorHandler } from "@utils";

class UserRepository {
  async getUserByEmail(email: string): Promise<boolean> {
    try {
      const user = await User.findOne({ email });

      return Boolean(user);
    } catch (error: any) {
      mongoDBErrorHandler("getUserByEmail", error, { email });
      return false;
    }
  }
  async getUserByUserId(userId: string): Promise<boolean> {
    try {
      const user = await User.findOne({ userId });

      return Boolean(user);
    } catch (error: any) {
      mongoDBErrorHandler("getUserByUserId", error, { userId });
      return false;
    }
  }
  async getUserByPhone(phone: string): Promise<boolean> {
    try {
      const user = await User.findOne({ phone });

      return Boolean(user);
    } catch (error: any) {
      mongoDBErrorHandler("getUserByPhone", error, { phone });
      return false;
    }
  }
}

export default new UserRepository();
