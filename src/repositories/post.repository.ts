import { Post } from "@models";
import { IPost, IPostRequestDto } from "@types";
import { mongoDBErrorHandler } from "@utils";
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

  async getPostsByUserId(userId: string): Promise<IPost[] | undefined> {
    try {
      const posts = Post.find({ userId });

      return posts;
    } catch (error) {
      mongoDBErrorHandler("getPostsByUserId", error, { userId });
    }
  }
}

export default new PostRepository();
