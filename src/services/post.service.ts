import { InternalServerError } from "@errors";
import { postRepository } from "@repositories";
import { IPost, PostDTO } from "@types";
import mongoose from "mongoose";

class PostService {
  async createPost(
    post: PostDTO,
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
}

export default new PostService();
