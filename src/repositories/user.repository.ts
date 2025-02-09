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
}

export default new UserRepository();
