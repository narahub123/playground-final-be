import { InternalServerError, NotFoundError } from "@errors";
import {
  postRepository,
  userPostActionRepository,
  userRepository,
} from "@repositories";
import {
  ICommentRequestDto,
  IPost,
  IPostRequestDto,
  IPostResponseDto,
  IRepostRequestDto,
} from "@types";
import mongoose, { ClientSession, Types, UpdateResult } from "mongoose";
import userService from "./user.service";
import userPostActionService from "./user-post-action.service";

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
      const origin = await postRepository.getPostById(repost.originalPostId);

      if (!origin) {
        throw new NotFoundError("original 포스트 조회 실패");
      }

      const { _id, originalPost } = origin;

      const modified: IRepostRequestDto = {
        type: "repost",
        author: repost.author,
        originalPostId: originalPost ? originalPost._id : repost.originalPostId,
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

      for (const postId of [repost.originalPostId, originalPost?._id]) {
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

  async getPostById(postId: Types.ObjectId): Promise<IPostResponseDto> {
    const post = await postRepository.getPostById(postId);

    if (!post) {
      throw new NotFoundError("포스트 조회 실패");
    }

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

  async addLike(postId: Types.ObjectId, session?: ClientSession) {
    const result = await postRepository.addLike(postId, session);

    if (!result) {
      throw new InternalServerError("좋아요 추가 도중 에러 발생");
    }

    if (result.matchedCount === 0) {
      throw new NotFoundError("UserPostAction 조회 실패");
    }

    if (result.modifiedCount === 0) {
      throw new InternalServerError("좋아요 추가 실패");
    }
  }

  async removeLike(postId: Types.ObjectId, session?: ClientSession) {
    const result = await postRepository.removeLike(postId, session);

    if (!result) {
      throw new InternalServerError("좋아요 삭제 도중 에러 발생");
    }

    if (result.matchedCount === 0) {
      throw new NotFoundError("UserPostAction 조회 실패");
    }

    if (result.modifiedCount === 0) {
      throw new InternalServerError("좋아요 삭제 실패");
    }
  }

  async setLikeCount(
    postId: Types.ObjectId,
    count: number,
    session?: ClientSession
  ) {
    const result = await postRepository.setLikeCount(postId, count, session);

    if (!result) {
      throw new InternalServerError("좋아요 수 정리 도중 에러 발생");
    }

    if (result.matchedCount === 0) {
      throw new NotFoundError("UserPostAction 조회 실패");
    }

    if (result.modifiedCount === 0) {
      throw new InternalServerError("좋아요 수 정리 실패");
    }
  }

  async updatePostAndUserLikes(postId: Types.ObjectId, userId: Types.ObjectId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingLike = await userPostActionService.getLikeByUserIdAndPostId(
        userId,
        postId
      );

      if (existingLike) {
        existingLike.isDeleted
          ? await this.addLike(postId, session)
          : await this.removeLike(postId, session);

        await userPostActionService.updateLike(
          existingLike._id,
          existingLike.isDeleted,
          session
        );
      } else {
        await this.addLike(postId, session);
        await userPostActionService.addLike(userId, postId, session);
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async addBookmark(postId: Types.ObjectId, session?: ClientSession) {
    const result = await postRepository.addBookmark(postId, session);

    if (!result) {
      throw new InternalServerError("북마크 추가 도중 에러 발생");
    }

    if (result.matchedCount === 0) {
      throw new NotFoundError("UserPostAction 조회 실패");
    }

    if (result.modifiedCount === 0) {
      throw new InternalServerError("북마크 추가 실패");
    }
  }

  async removeBookmark(postId: Types.ObjectId, session?: ClientSession) {
    const result = await postRepository.removeBookmark(postId, session);

    if (!result) {
      throw new InternalServerError("북마크 삭제 도중 에러 발생");
    }

    if (result.matchedCount === 0) {
      throw new NotFoundError("UserPostAction 조회 실패");
    }

    if (result.modifiedCount === 0) {
      throw new InternalServerError("북마크 삭제 실패");
    }
  }

  async setBookmarkCount(
    postId: Types.ObjectId,
    count: number,
    session?: ClientSession
  ) {
    const result = await postRepository.setBookmarkCount(
      postId,
      count,
      session
    );

    if (!result) {
      throw new InternalServerError("북마크 수 정리 도중 에러 발생");
    }

    if (result.matchedCount === 0) {
      throw new NotFoundError("UserPostAction 조회 실패");
    }

    if (result.modifiedCount === 0) {
      throw new InternalServerError("북마크 수 정리 실패");
    }
  }

  async updatePostAndUserBookmarks(
    postId: Types.ObjectId,
    userId: Types.ObjectId
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingBookmark =
        await userPostActionService.getBookmarkByUserIdAndPostId(
          userId,
          postId
        );

      if (existingBookmark) {
        existingBookmark.isDeleted
          ? await this.addBookmark(postId, session)
          : await this.removeBookmark(postId, session);

        await userPostActionService.updateBookmark(
          existingBookmark._id,
          existingBookmark.isDeleted,
          session
        );
      } else {
        await this.addBookmark(postId, session);
        await userPostActionService.addBookmark(userId, postId, session);
      }

      const post = await this.getPostById(postId);
      const existingBookmarks =
        await userPostActionRepository.getBookmarksByPostId(postId);

      if (post.actions.bookmarks !== existingBookmarks.length) {
        await this.setBookmarkCount(postId, existingBookmarks.length, session);
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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

  async createComment(
    comment: ICommentRequestDto,
    session?: ClientSession
  ): Promise<IPostResponseDto> {
    const newComment = await postRepository.createComment(comment, session);

    if (!newComment) {
      throw new InternalServerError("댓글 생성 중 에러 발생");
    }

    if (!newComment.originalPostId) {
      throw new InternalServerError("댓글 생성 중 에러 발생");
    }

    return newComment;
  }

  async addComment(
    postId: Types.ObjectId,
    commentId: Types.ObjectId,
    session?: ClientSession
  ) {
    const result = await postRepository.addComment(postId, commentId, session);

    if (result?.matchedCount === 0) {
      throw new NotFoundError("포스트 조회 실패");
    }

    if (!result || result.modifiedCount === 0) {
      throw new InternalServerError("댓글 추가 중 에러 발생");
    }
  }

  async createAndAddComment(comment: ICommentRequestDto) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { originalPostId } = comment;

      await this.getPostById(originalPostId);

      const newComment = await this.createComment(comment, session);

      const { _id: commentId } = newComment;

      await this.addComment(originalPostId, commentId, session);
      await session.commitTransaction();

      return newComment;
    } catch (error: any) {
      await session.abortTransaction();
      throw new InternalServerError("댓글 생성 및 추가 중 에러 발생", error);
    } finally {
      session.endSession();
    }
  }

  async getCommentByPostId(originalPostId: Types.ObjectId, skip: number) {
    // originalPostId의 유효성 확인
    await this.getPostById(originalPostId);

    const comments = await postRepository.getCommentsByPostId(
      originalPostId,
      skip
    );

    return comments;
  }
}

export default new PostService();
