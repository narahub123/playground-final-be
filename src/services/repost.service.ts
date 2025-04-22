import { repostRepository } from "@repositories";
import { IPostResponseDto } from "@types";
import { Types } from "mongoose";

class RepostService {
  async addRepost(
    postId: Types.ObjectId,
    userId: Types.ObjectId,
    text?: string
  ) {
    const post = await repostRepository.addRepost(postId, userId, text);

    if (!post) return null;

    const count = await repostRepository.getRepostCountByPostId(postId);

    return {
      ...post,
      actions: {
        ...post.actions,
        reposts: {
          count,
          isReposted: true,
        },
      },
    };
  }

  async getRepostsByUser(userId: Types.ObjectId): Promise<IPostResponseDto[]> {
    const reposts = await repostRepository.getRepostsByUser(userId);

    const modified = await Promise.all(
      reposts.map(async (post) => ({
        ...post,
        actions: {
          ...post.actions,
          reposts: {
            count: await repostRepository.getRepostCountByPostId(post._id),
            isReposted: await this.IsRepostedByUser(userId, post._id),
          },
        },
      }))
    );

    return modified;
  }

  async getRepostCountByPostId(postId: Types.ObjectId): Promise<number> {
    return await repostRepository.getRepostCountByPostId(postId);
  }

  async IsRepostedByUser(
    userId: Types.ObjectId,
    postId: Types.ObjectId
  ): Promise<boolean> {
    const result = await repostRepository.findRepostByUserIdAnPostId(
      userId,
      postId
    );

    return result ? true : false;
  }
}

export default new RepostService();
