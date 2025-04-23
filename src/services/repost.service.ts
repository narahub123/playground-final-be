import { InternalServerError, NotFoundError } from "@errors";
import { repostRepository } from "@repositories";
import { IPostResponseDto, IRepost } from "@types";
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

    return reposts;
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

  async findRepostById(repostId: Types.ObjectId): Promise<IRepost | null> {
    const repost = await repostRepository.findRepostById(repostId);

    return repost;
  }

  async deleteRepost(repostId: Types.ObjectId) {
    const result = await repostRepository.deleteRepost(repostId);

    if (!result) {
      throw new InternalServerError("재게시 삭제 도중 에러 발생");
    }

    if (result.deletedCount === 0) {
      throw new InternalServerError("재게시 삭제 도중 에러 발생");
    }
  }

  async updatePin(repostId: Types.ObjectId): Promise<void> {
    const repost = await repostRepository.findRepostById(repostId);

    if (!repost) {
      throw new NotFoundError("리포스트 조회 실패");
    }

    const result = await repostRepository.updatePin(repostId);

    if (!result) {
      throw new InternalServerError("핀 업데이트 중 에러 발생");
    }
    if (result.matchedCount === 0) {
      throw new NotFoundError("리포스트 조회 실패");
    }
    if (result.matchedCount === 0) {
      throw new InternalServerError("핀 업데이트 중 에러 발생");
    }
  }
}

export default new RepostService();
