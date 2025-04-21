import { InternalServerError } from "@errors";
import { postRepository } from "@repositories";
import { IPost, IPostRequestDto } from "@types";
import mongoose, { Types } from "mongoose";

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

  async getPostsByAuthor(author: mongoose.Types.ObjectId) {
    return await postRepository.getPostsByAuthor(author);
  }

  async getPostById(postId: Types.ObjectId): Promise<IPost | null> {
    const post = postRepository.getPostById(postId);

    return post;
  }

  async updatePostVoteWithUserId(
    postId: Types.ObjectId,
    userId: Types.ObjectId,
    optionIndex: number
  ): Promise<boolean> {
    const result = await postRepository.updatePostVoteWithUserId(
      postId,
      userId,
      optionIndex
    );

    if (!result || result.modifiedCount === 0) {
      throw new InternalServerError("알 수 없는 이유로 업데이트 안됨");
    }

    return true;
  }
}

export default new PostService();
