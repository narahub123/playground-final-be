import { NotFoundError } from "@errors";
import {
  getUserByEmail,
  getUserByPhone,
  getUserByUserId,
} from "./user-finder.service";

class UserService {
  async findUserByIndentifier(email?: string, phone?: string, userId?: string) {
    let user;

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
}

export default new UserService();
