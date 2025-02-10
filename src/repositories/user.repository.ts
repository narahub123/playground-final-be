import mongoose from "mongoose";
import { User } from "@models";
import { IUser, IUserInput } from "@types";
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
  async createUser(
    user: IUserInput,
    options?: { session: mongoose.ClientSession }
  ): Promise<IUser | undefined> {
    try {
      const newUser = await User.create([user], options);

      return newUser[0] || undefined;
    } catch (error) {
      mongoDBErrorHandler("createUser", error, { user });
    }
  }
}

export default new UserRepository();
