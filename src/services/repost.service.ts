import { repostRepository } from "@repositories";
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
}

export default new RepostService();
