import { Post, Repost } from "@models";
import { IAuthor, IPostResponseDto } from "@types";
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
}

export default new RepostRepository();
