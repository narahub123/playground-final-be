import { NotFoundError } from "@errors";
import { User } from "@models";

const fetchUserByUserId = async (userId: string) => {
  try {
    const user = await User.findOne({ userId });
    if (!user) {
      throw new NotFoundError(
        `${userId} 아이디를 가진 유저를 찾을 수 없습니다.`
      );
    }
    return user;
  } catch (error: any) {
    console.error(`[fetchUserByUserId] Error: ${error.message}`, {
      userId,
      stack: error.stack,
    });
    throw error;
  }
};

export { fetchUserByUserId };
