import { NotFoundError } from "@errors";
import {
  getUserByEmail,
  getUserByPhone,
  getUserByUserId,
} from "./user-finder.service";
import { INotificationInput, IUser, IUserInput } from "@types";
import {
  displayRepository,
  notificationRepository,
  privacyRepository,
  securityRepository,
  userRepository,
} from "@repositories";
import mongoose from "mongoose";

class UserService {
  async findUserByIndentifier(
    email?: string,
    phone?: string,
    userId?: string
  ): Promise<IUser> {
    let user: IUser | undefined;

    if (email) {
      user = await getUserByEmail(email);
    } else if (phone) {
      user = await getUserByPhone(phone);
    } else if (userId) {
      user = await getUserByUserId(userId);
    }

    if (!user) {
      throw new NotFoundError("조건에 맞는 사용자를 찾을 수 없습니다.");
    }

    return user;
  }

  async initializeUser(
    newUser: IUserInput,
    newNotification: INotificationInput,
    userId: string,
    session: mongoose.ClientSession
  ) {
    await userRepository.createUser(newUser, { session });
    await securityRepository.createSecurity(userId, { session });
    await notificationRepository.createNotification(newNotification, {
      session,
    });
    await displayRepository.createDisplay(userId, { session });
    await privacyRepository.createPrivacy(userId, { session });
  }
}

export default new UserService();
