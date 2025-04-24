import { InternalServerError, NotFoundError } from "@errors";
import { postRepository, userRepository } from "@repositories";
import {
  IPost,
  IPostRequestDto,
  IPostResponseDto,
  IRepostRequestDto,
} from "@types";
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

  async createRepost(repost: IRepostRequestDto) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const originalPost = await postRepository.getPostById(
        repost.originalPostId
      );

      if (!originalPost) {
        throw new NotFoundError("original 포스트 조회 실패");
      }

      const { originalPostId, _id } = originalPost;

      const modified: IRepostRequestDto = {
        type: "repost",
        author: repost.author,
        originalPostId: originalPostId ? originalPostId : repost.originalPostId,
      };

      const newPost = await postRepository.createRepost(modified, session);

      if (!newPost) {
        throw new InternalServerError(
          "Failed to create repost. (리포스트 생성 실패)",
          "REPOST_CREATION_ERROR",
          {
            repost: "REPOST_CREATION_FAILED",
          }
        );
      }

      for (const postId of [repost.originalPostId, originalPostId]) {
        if (!postId) continue;

        const result = await postRepository.addRepost(
          postId,
          modified.author,
          session
        );

        if (!result) {
          throw new InternalServerError("리포스트 추가 도중 에러 발생");
        }

        if (result?.matchedCount === 0) {
          throw new NotFoundError("오리지널 포스트를 찾을 수 없음");
        }

        if (result?.modifiedCount === 0) {
          throw new InternalServerError("리포스트 추가 도중 에러 발생");
        }
      }

      await session.commitTransaction();
      return newPost;
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getPostsForProfilePage(
    author: mongoose.Types.ObjectId
  ): Promise<IPostResponseDto[]> {
    const posts = await postRepository.getPostsByAuthor(author);

    const user = await userRepository.getUserById(author);

    if (!user) {
      throw new NotFoundError("사용자를 찾을 수 없습니다.");
    }
    const { pinnedPost: pinId } = user;

    if (pinId) {
      const pinnedPost = posts.find((post) => post._id === pinId);

      if (!pinnedPost) {
        throw new InternalServerError("포스트 조회 실패");
      }

      const postsWithoutPin = posts.filter((post) => post._id !== pinId);

      const modified = [pinnedPost, ...postsWithoutPin];

      return modified;
    }

    return posts;
  }

  async addView(postId: Types.ObjectId) {
    const result = await postRepository.addView(postId);

    if (!result || result.modifiedCount === 0) {
      throw new InternalServerError("조회수 처리 중 에러 발생");
    }

    if (result.matchedCount === 0) {
      throw new NotFoundError("포스트 조회 실패");
    }
  }

  async getPostsByAuthor(
    author: mongoose.Types.ObjectId
  ): Promise<IPostResponseDto[]> {
    const posts = await postRepository.getPostsByAuthor(author);

    await Promise.all(posts.map((post) => this.addView(post._id)));

    return posts;
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

  async deletePost(postId: Types.ObjectId, userId: Types.ObjectId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let removedPostIds: Types.ObjectId[] = [];

      const post = await postRepository.deletePost(postId, session);

      if (!post) {
        throw new InternalServerError("포스트 삭제 도중 에러 발생");
      }

      removedPostIds.push(postId);

      if (post.type === "repost") {
        const result = await postRepository.removeRepost(
          post.originalPostId!,
          userId,
          session
        );

        if (!result) {
          throw new InternalServerError("포스트 삭제 도중 에러 발생");
        }

        if (result.modifiedCount === 0) {
          throw new InternalServerError("포스트 삭제 도중 에러 발생");
        }
      } else {
        // 해당 게시물을 재게시한 것들을 전부 삭제
        const reposts = await postRepository.getRepostsByOriginalPostId(postId);

        await Promise.all(
          reposts.map(async (repost) => {
            const post = await postRepository.deletePost(repost._id, session);

            if (!post) {
              throw new InternalServerError("포스트 삭제 도중 에러 발생");
            }
          })
        );

        removedPostIds.push(...reposts.map((repost) => repost._id));
      }

      // 해당 포스트가 pinnedPost 인 경우 pinnedPost 제거하기
      const user = await userRepository.getUserById(userId);

      if (!user) {
        throw new NotFoundError("사용자 조회 실패");
      }

      if (Boolean(user.pinnedPost) && user.pinnedPost.equals(postId)) {
        const result = await userRepository.removePinnedPost(user._id, session);

        if (!result || result.modifiedCount === 0)
          throw new InternalServerError("핀포스트 삭제 중 에러 발생");

        if (result.matchedCount === 0)
          throw new NotFoundError("사용자 조회 실패");
      }

      await session.commitTransaction();

      return removedPostIds;
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updatePin(postId: Types.ObjectId) {
    const post = await this.getPostById(postId);

    if (!post) {
      throw new NotFoundError("포스트를 찾을 수 없습니다.");
    }

    const result = await postRepository.updatePin(postId);

    if (!result) {
      throw new InternalServerError("핀 처리 도중 에러 발생");
    }

    if (result.matchedCount === 0) {
      throw new NotFoundError("포스트를 찾을 수 없습니다.");
    }

    if (result.modifiedCount === 0) {
      throw new InternalServerError("핀 처리 도중 에러 발생");
    }
  }
}

export default new PostService();
