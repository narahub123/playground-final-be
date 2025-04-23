import { Post } from "@models";
import {
  IAuthor,
  IPost,
  IPostRequestDto,
  IPostResponseDto,
  IUser,
} from "@types";
import { mapPostToIPostResponseDto, mongoDBErrorHandler } from "@utils";
import mongoose, {
  DeleteResult,
  Types,
  UpdateResult,
  UpdateWriteOpResult,
} from "mongoose";

class PostRepository {
  async createPost(
    post: IPostRequestDto,
    options?: { session: mongoose.ClientSession }
  ): Promise<IPost | undefined> {
    try {
      const newPost = await Post.create([post], options);

      return newPost[0] || undefined;
    } catch (error) {
      mongoDBErrorHandler("createPost", error, { post });
    }
  }

  async getPostsByAuthor(
    authorId: mongoose.Types.ObjectId
  ): Promise<IPostResponseDto[]> {
    try {
      const posts = await Post.aggregate<IPostResponseDto>([
        { $match: { author: authorId } },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "postAuthor",
          },
        },
        {
          $unwind: {
            path: "$postAuthor",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "posts",
            localField: "originalPostId",
            foreignField: "_id",
            as: "originalPost",
          },
        },
        {
          $unwind: { path: "$originalPost", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "users",
            localField: "originalPost.author._id",
            foreignField: "_id",
            as: "originalPostAuthor",
          },
        },
        {
          $unwind: {
            path: "$originalPostAuthor",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: "$_id",
            type: "$type",
            text: "$text",
            media: "$media",
            schedule: "$schedule",
            vote: "$vote",
            actions: "$actions",
            pin: "$pin",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
            author: {
              _id: "$postAuthor._id",
              userId: "$postAuthor.userId",
              username: "$postAuthor.username",
              profileImage: "$postAuthor.profileImage",
            },
            originalPost: {
              _id: "$originalPost._id",
              type: "$originalPost.type",
              text: "$originalPost.text",
              media: "$originalPost.media",
              schedule: "$originalPost.schedule",
              vote: "$originalPost.vote",
              actions: "$originalPost.actions",
              pin: "$originalPost.pin",
              createdAt: "$originalPost.createdAt",
              updatedAt: "$originalPost.updatedAt",
              author: {
                _id: "$originalPostAuthor._id",
                userId: "$originalPostAuthor.userId",
                username: "$originalPostAuthor.username",
                profileImage: "$originalPostAuthor.profileImage",
              },
            },
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      return posts;
    } catch (error) {
      mongoDBErrorHandler("getPostsByAuthor", error, { user_id: authorId });
      return [];
    }
  }

  async getPostById(_id: Types.ObjectId): Promise<IPost | null> {
    try {
      const post = await Post.findById(_id);

      return post;
    } catch (error) {
      mongoDBErrorHandler("getPostById", error, { _id });
      return null;
    }
  }

  async updatePostVoteWithUserId(
    postId: Types.ObjectId,
    userId: Types.ObjectId,
    optionIndex: number
  ): Promise<UpdateWriteOpResult | null> {
    try {
      const result = await Post.updateOne(
        { _id: postId },
        { $addToSet: { [`vote.options.${optionIndex}.voters`]: userId } }
      );

      return result;
    } catch (error) {
      mongoDBErrorHandler("updatePostVoteWithUserId", error, {
        postId,
        userId,
        optionIndex,
      });
      return null;
    }
  }

  async addLike(
    postId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<UpdateResult | undefined> {
    try {
      const result = await Post.updateOne(
        { _id: postId },
        { $addToSet: { [`actions.likes`]: userId } }
      );

      return result;
    } catch (error) {
      mongoDBErrorHandler("addLike", error, {
        postId,
        userId,
      });
      return undefined;
    }
  }

  async deleteLike(
    postId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<UpdateResult | undefined> {
    try {
      const result = await Post.updateOne(
        { _id: postId },
        { $pull: { [`actions.likes`]: userId } }
      );

      return result;
    } catch (error) {
      mongoDBErrorHandler("deleteLike", error, {
        postId,
        userId,
      });
      return undefined;
    }
  }

  async deletePost(postId: Types.ObjectId): Promise<DeleteResult | undefined> {
    try {
      const result = await Post.deleteOne({ _id: postId });

      return result;
    } catch (error) {
      mongoDBErrorHandler("deleteLike", error, {
        postId,
      });
      return undefined;
    }
  }

  async updatePin(postId: Types.ObjectId): Promise<UpdateResult | undefined> {
    try {
      return await Post.updateOne({ _id: postId }, [
        { $set: { pin: { $not: "$pin" } } },
      ]);
    } catch (error) {
      mongoDBErrorHandler("updatePin", error, { postId });
      return undefined;
    }
  }
}

export default new PostRepository();
