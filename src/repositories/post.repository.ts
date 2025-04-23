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
    author: mongoose.Types.ObjectId
  ): Promise<IPostResponseDto[]> {
    try {
      const posts = await Post.find({ author })
        .populate(
          "author",
          "userId username profileImage intro followings followers"
        )
        .sort({ createdAt: -1 });

      return posts.map((post) =>
        mapPostToIPostResponseDto(
          post.toObject() as unknown as IPost & { author: IAuthor }
        )
      );
    } catch (error) {
      mongoDBErrorHandler("getPostsByAuthor", error, { author });
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
