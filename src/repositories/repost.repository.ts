import { Post, Repost } from "@models";
import { IAuthor, IPostResponseDto, IRepost } from "@types";
import { mongoDBErrorHandler } from "@utils";
import { Types } from "mongoose";

class RepostRepository {
  async addRepost(
    postId: Types.ObjectId,
    userId: Types.ObjectId,
    text?: string
  ): Promise<IPostResponseDto | null> {
    try {
      const repost = await Repost.create({
        post: postId,
        user: userId,
        text,
      });

      const result = await Repost.aggregate<IPostResponseDto>([
        { $match: { _id: repost._id } },
        {
          $lookup: {
            from: "posts",
            localField: "post",
            foreignField: "_id",
            as: "post",
          },
        },
        { $unwind: "$post" },
        {
          $lookup: {
            from: "users",
            localField: "post.author",
            foreignField: "_id",
            as: "postAuthor",
          },
        },
        { $unwind: "$postAuthor" },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "repostUser",
          },
        },
        { $unwind: "$repostUser" },
        {
          $project: {
            _id: "$post._id",
            text: "$post.text",
            media: "$post.media",
            schedule: "$post.schedule",
            vote: "$post.vote",
            actions: "$post.actions",
            createdAt: "$post.createdAt",
            updatedAt: "$post.updatedAt",
            author: {
              _id: "$postAuthor._id",
              userId: "$postAuthor.userId",
              username: "$postAuthor.username",
              profileImage: "$postAuthor.profileImage",
            },
            repostUser: {
              repostId: "$_id", // Repost 문서의 _id
              _id: "$repostUser._id",
              userId: "$repostUser.userId",
              username: "$repostUser.username",
              repostedAt: "$createdAt", // Repost 문서의 createdAt
            },
          },
        },
      ]);

      console.log("result", result[0]);

      return result[0] || null;
    } catch (error) {
      mongoDBErrorHandler("addRepost", error, { postId, userId, text });
      return null;
    }
  }

  async getRepostsByUser(userId: Types.ObjectId): Promise<IPostResponseDto[]> {
    try {
      const reposts = await Repost.aggregate<IPostResponseDto>([
        { $match: { user: userId } },
        {
          $lookup: {
            from: "posts",
            localField: "post",
            foreignField: "_id",
            as: "post",
          },
        },
        { $unwind: "$post" },
        {
          $lookup: {
            from: "users",
            localField: "post.author",
            foreignField: "_id",
            as: "postAuthor",
          },
        },
        { $unwind: "$postAuthor" },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "repostUser",
          },
        },
        { $unwind: "$repostUser" },
        {
          $project: {
            _id: "$post._id",
            text: "$post.text",
            media: "$post.media",
            schedule: "$post.schedule",
            vote: "$post.vote",
            actions: "$post.actions",
            createdAt: "$post.createdAt",
            updatedAt: "$post.updatedAt",
            author: {
              _id: "$postAuthor._id",
              userId: "$postAuthor.userId",
              username: "$postAuthor.username",
              profileImage: "$postAuthor.profileImage",
            },
            repostUser: {
              repostId: "$_id",
              _id: "$repostUser._id",
              userId: "$repostUser.userId",
              username: "$repostUser.username",
              repostedAt: "$createdAt",
            },
          },
        },
        {
          $sort: {
            "repostUser.repostedAt": -1,
          },
        },
      ]);

      return reposts;
    } catch (error) {
      mongoDBErrorHandler("getRepostsByUser", error, { _id: userId });
      return [];
    }
  }

  async getRepostCountByPostId(postId: Types.ObjectId): Promise<number> {
    try {
      return await Repost.countDocuments({ post: postId });
    } catch (error) {
      mongoDBErrorHandler("getRepostsByUser", error, { _id: postId });
      return 0;
    }
  }

  async findRepostByUserIdAnPostId(
    userId: Types.ObjectId,
    postId: Types.ObjectId
  ): Promise<IRepost | null> {
    try {
      return await Repost.findOne({ user: userId, post: postId });
    } catch (error) {
      mongoDBErrorHandler("findRepostByUserIdAnPostId", error, {
        userId,
        postId,
      });
      return null;
    }
  }
}

export default new RepostRepository();
