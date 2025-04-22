import { InternalServerError, NotFoundError } from "@errors";
import { postRepository, repostRepository } from "@repositories";
import { IPost, IPostRequestDto, IPostResponseDto } from "@types";
import mongoose, { ClientSession, Types, UpdateResult } from "mongoose";
import repostService from "./repost.service";

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

  async getPostsByAuthor(
    author: mongoose.Types.ObjectId
  ): Promise<IPostResponseDto[]> {
    const posts = await postRepository.getPostsByAuthor(author);

    const modified = await Promise.all(
      posts.map(async (post) => ({
        ...post,
        actions: {
          ...post.actions,
          reposts: {
            count: await repostRepository.getRepostCountByPostId(post._id),
            isReposted: await repostService.IsRepostedByUser(author, post._id),
          },
        },
      }))
    );

    return modified;
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

  async updateLikes(postId: Types.ObjectId, userId: Types.ObjectId) {
    const post = await this.getPostById(postId);
    if (!post) {
      throw new NotFoundError("포스트를 찾을 수 없습니다.");
    }

    const alreadyLike = post.actions.likes.includes(userId);

    const result = alreadyLike
      ? await postRepository.deleteLike(postId, userId)
      : await postRepository.addLike(postId, userId);

    if (!result) {
      throw new InternalServerError("서버 내부 에러");
    }

    if (result.matchedCount === 0) {
      // 조건에 맞는 document가 없었음 → postId 잘못됐을 가능성
      throw new NotFoundError(
        "조건에 맞는 포스트를 찾지 못함",
        "POST_NOT_MATCHED",
        {
          postId,
          userId,
        }
      );
    }

    if (result.modifiedCount === 0) {
      // 조건은 맞지만 실제 업데이트된 건 없음
      // 예: 이미 좋아요가 추가된 상태에서 다시 추가 시도
      throw new InternalServerError("포스트의 좋아요 업데이트가 되지 않음");
    }

    return alreadyLike ? false : true;
  }
}

export default new PostService();
