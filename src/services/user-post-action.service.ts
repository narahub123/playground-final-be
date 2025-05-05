import { InternalServerError, NotFoundError } from "@errors";
import { userPostActionRepository } from "@repositories";
import { IUserPostAction } from "@types";
import { ClientSession, Types } from "mongoose";

class UserPostActionService {
  async getLikeByUserIdAndPostId(
    userId: Types.ObjectId,
    postId: Types.ObjectId
  ) {
    const like = await userPostActionRepository.findLikeByUserIdAndPostId(
      userId,
      postId
    );

    return like;
  }

  async getLikesByPostId(postId: Types.ObjectId): Promise<IUserPostAction[]> {
    const likes = await userPostActionRepository.getLikesByPostId(postId);

    return likes;
  }

  async addLike(
    userId: Types.ObjectId,
    postId: Types.ObjectId,
    session?: ClientSession
  ) {
    const like = await userPostActionRepository.addLike(
      userId,
      postId,
      session
    );

    if (!like) {
      throw new InternalServerError("좋아요 추가 실패");
    }
  }

  async updateLike(
    _id: Types.ObjectId,
    isDeleted: boolean,
    session?: ClientSession
  ) {
    const result = await userPostActionRepository.updateLike(
      _id,
      isDeleted,
      session
    );

    if (!result) {
      throw new InternalServerError("좋아요 업데이트 도중 에러 발생");
    }

    if (result.matchedCount === 0) {
      throw new NotFoundError("UserPostAction 조회 실패");
    }

    if (result.modifiedCount === 0) {
      throw new InternalServerError("좋아요 업데이트 실패");
    }
  }
}

export default new UserPostActionService();
