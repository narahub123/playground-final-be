import { Post } from "@models";
import { IPost, PostDTO } from "@types";
import { mongoDBErrorHandler } from "@utils";
import mongoose from "mongoose";

class PostRepository {
  async createPost(
    post: PostDTO,
    options?: { session: mongoose.ClientSession }
  ): Promise<IPost | undefined> {
    try {
      const newPost = await Post.create([post], options);

      return newPost[0] || undefined;
    } catch (error) {
      mongoDBErrorHandler("createPost", error, { post });
    }
  }
}

export default new PostRepository();
