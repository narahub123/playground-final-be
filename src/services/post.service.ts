import { InternalServerError } from "@errors";
import { postRepository } from "@repositories";
import { IPost, IPostRequestDto } from "@types";
import mongoose from "mongoose";

class PostService {
  async createPost(
    post: IPostRequestDto,
    session: mongoose.ClientSession
  ): Promise<IPost> {
    const newPost = await postRepository.createPost(post, { session });

    if (!newPost) {
      throw new InternalServerError(
        "Failed to create post. (포스트 생성 실패)",
        "POST_CREATION_ERROR",
        {
          session: "POST_CREATION_FAILED",
        }
      );
    }

    return newPost;
  }

  async getPostsByUserId(userId: string) {
    return await postRepository.getPostsByUserId(userId);
  }
}

export default new PostService();
