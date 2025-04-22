import { repostRepository } from "@repositories";
import { IPostResponseDto } from "@types";
import { Types } from "mongoose";

class RepostService {
  async addRepost(
    postId: Types.ObjectId,
    userId: Types.ObjectId,
    text?: string
  ) {
    const result = await repostRepository.addRepost(postId, userId, text);

    return result;
  }

  async getRepostsByUser(userId: Types.ObjectId): Promise<IPostResponseDto[]> {
    return await repostRepository.getRepostsByUser(userId);
  }
}

export default new RepostService();
