import { UserPostAction } from "@models";
import { IUserPostAction } from "@types";
import { mongoDBErrorHandler } from "@utils";
import { ClientSession, Types, UpdateResult } from "mongoose";

class UserPostActionRepository {
  async findLikeByUserIdAndPostId(
    userId: Types.ObjectId,
    postId: Types.ObjectId
  ): Promise<IUserPostAction | null> {
    try {
      const like = await UserPostAction.findOne({
        userId,
        postId,
        type: "like",
      });

      return like;
    } catch (error) {
      mongoDBErrorHandler("findLikeByUserIdAndPostId", error, {
        postId,
        userId,
      });
      return null;
    }
  }

  async getLikesByPostId(postId: Types.ObjectId): Promise<IUserPostAction[]> {
    try {
      const likes = await UserPostAction.find({ postId, type: "like" });

      return likes;
    } catch (error) {
      mongoDBErrorHandler("getLikesByPostId", error, {
        postId,
      });
      return [];
    }
  }

  async getLikesByUserId(userId: Types.ObjectId): Promise<IUserPostAction[]> {
    try {
      const likes = await UserPostAction.find({ userId, type: "like" });

      return likes;
    } catch (error) {
      mongoDBErrorHandler("getLikesByUserId", error, {
        userId,
      });
      return [];
    }
  }

  async addLike(
    userId: Types.ObjectId,
    postId: Types.ObjectId,
    session?: ClientSession
  ): Promise<IUserPostAction | undefined> {
    try {
      const userPostAction = await UserPostAction.create(
        [
          {
            userId,
            postId,
            type: "like",
            isDeleted: false,
            deletedAt: null,
          },
        ],
        { session }
      );

      return userPostAction[0];
    } catch (error) {
      mongoDBErrorHandler("addLike", error, {
        postId,
        userId,
      });
    }
  }

  async updateLike(
    _id: Types.ObjectId,
    isCurrentlyDeleted: boolean,
    session?: ClientSession
  ): Promise<UpdateResult | undefined> {
    try {
      const updateQuery = UserPostAction.updateOne(
        { _id },
        {
          $set: {
            isDeleted: !isCurrentlyDeleted,
            deletedAt: isCurrentlyDeleted ? null : new Date(),
          },
        }
      );

      const result = session
        ? await updateQuery.session(session)
        : await updateQuery;

      return result;
    } catch (error) {
      mongoDBErrorHandler("updateLike", error, {
        _id,
        isCurrentlyDeleted,
      });
    }
  }

  async getBookmarksByUserId(
    userId: Types.ObjectId
  ): Promise<IUserPostAction[]> {
    try {
      const bookmarks = await UserPostAction.find({ userId, type: "bookmark" });

      return bookmarks;
    } catch (error) {
      mongoDBErrorHandler("getBookmarksByUserId", error, {
        userId,
      });
      return [];
    }
  }
}

export default new UserPostActionRepository();
