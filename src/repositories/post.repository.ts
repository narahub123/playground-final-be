import { Post } from "@models";
import {
  IAuthor,
  IPost,
  IPostRequestDto,
  IPostResponseDto,
  IUser,
} from "@types";
import { mapPostToIPostResponseDto, mongoDBErrorHandler } from "@utils";
import mongoose from "mongoose";

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
      const posts = await Post.find({ author }).populate(
        "author",
        "userId username profileImage"
      );

      return posts.map((post) =>
        mapPostToIPostResponseDto(
          post as unknown as IPost & { author: IAuthor }
        )
      );
    } catch (error) {
      mongoDBErrorHandler("getPostsByAuthor", error, { author });
      return [];
    }
  }
}

export default new PostRepository();
