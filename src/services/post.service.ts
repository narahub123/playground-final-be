import { ConflictError, InternalServerError, NotFoundError } from "@errors";
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
  IQuoteRequestDto,
  IRepostRequestDto,
} from "@types";
import mongoose, { ClientSession, Types, UpdateResult } from "mongoose";
import userService from "./user.service";
import userPostActionService from "./user-post-action.service";
import { aggregatePostById, deleteMedia, uploadMedia } from "@utils";

class PostService {
  async createPost(
    post: IPostRequestDto,
    session: mongoose.ClientSession
  ): Promise<IPostResponseDto> {
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

  async getPostsByUserAndFollowings(
    userIds: Types.ObjectId[],
    skip: number
  ): Promise<IPostResponseDto[]> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const posts = await postRepository.getPostsByAuthorAndFollowings(
        userIds,
        skip,
        session
      );

      await session.commitTransaction();

      return posts;
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getPostsByAuthor(
    author: mongoose.Types.ObjectId
  ): Promise<IPostResponseDto[]> {
    const posts = await postRepository.getPostsByAuthor(author);

    return posts;
  }

  async getPostById(
    postId: Types.ObjectId,
    userId: Types.ObjectId,
    session?: ClientSession
  ): Promise<IPostResponseDto> {
    const post = await postRepository.getPostById(postId, userId, session);

    if (!post) {
      throw new NotFoundError("포스트 조회 실패");
    }

    return post;
  }

  async getPurePostById(
    postId: Types.ObjectId,
    session?: ClientSession
  ): Promise<IPost> {
    const post = await postRepository.getPurePostById(postId, session);

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

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async removeComment(postId: Types.ObjectId, session?: ClientSession) {
    const result = await postRepository.removeComment(postId, session);

    if (!result) throw new InternalServerError("댓글 삭제 중 에러 발생");

    if (result.matchedCount === 0) throw new NotFoundError("포스트 조회 실패");

    if (result.modifiedCount === 0)
      throw new InternalServerError("댓글 삭제 실패");
  }

  async deletePost(postId: Types.ObjectId, session?: ClientSession) {
    const result = await postRepository.deletePost(postId, session);

    if (!result) throw new InternalServerError("포스트 삭제 중 에러 발생");

    if (result.matchedCount === 0) throw new NotFoundError("포스트 조회 실패");

    if (result.modifiedCount === 0)
      throw new InternalServerError("포스트 삭제 실패");
  }

  async deleteOriginalPostByPostId(
    postId: Types.ObjectId,
    session?: ClientSession
  ) {
    const result = await postRepository.deleteOriginalPostByPostId(
      postId,
      session
    );

    if (!result) throw new InternalServerError("원본 포스트 삭제 중 에러 발생");
  }

  async deletePostAndRemoveRecord(postId: Types.ObjectId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 포스트 존재 여부 확인
      const post = await this.getPurePostById(postId);

      // 포스트 삭제
      await this.deletePost(postId, session);

      // 원포스트 기록 삭제
      const { type, originalPostId } = post;
      if (originalPostId) {
        if (type === "quote" || type === "repost") {
          await this.decreaseRepost(originalPostId, session);
        }

        if (type === "comment") {
          await this.removeComment(originalPostId, session);
        }
      }

      // 액션 기록 삭제
      // likes 삭제
      await userPostActionService.deleteAllLikes(postId, session);
      // bookmarks 삭제
      await userPostActionService.deleteAllBookmarks(postId, session);

      // 해당 포스트를 원 포스트로 가지고 있는 포스트들의 isOriginalPostDeleted 변경
      await this.deleteOriginalPostByPostId(postId, session);

      // 해당 포스트가 핀 포스트인 경우
      await userService.removePinnedPostThroUsers(postId, session);

      await session.commitTransaction();
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updatePin(postId: Types.ObjectId) {
    await this.getPurePostById(postId);

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

      await this.getPurePostById(originalPostId);

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
    await this.getPurePostById(originalPostId);

    const comments = await postRepository.getCommentsByPostId(
      originalPostId,
      skip
    );

    return comments;
  }

  async createQuote(
    newQuote: IQuoteRequestDto,
    session?: ClientSession
  ): Promise<IPostResponseDto> {
    const quote = await postRepository.createQuote(newQuote, session);

    if (!quote) {
      throw new InternalServerError("인용 생성 중 에러 발생");
    }

    return quote;
  }

  async createAndAddQuote(newQuote: IQuoteRequestDto) {
    const { author, originalPostId, media, text } = newQuote;

    // 미디어 처리하기
    const newMedia = await uploadMedia(media);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // user 확인
      await userService.getUserById(author, session);

      // originalPost 확인
      await this.getPurePostById(originalPostId);

      // 인용 생성하기
      const quote = await this.createQuote(
        { ...newQuote, media: newMedia.map((medium) => medium.secure_url) },
        session
      );

      // 인용추가하기
      await this.increaseRepost(originalPostId, session);

      await session.commitTransaction();

      return quote;
    } catch (error) {
      if (newMedia.length > 0) {
        await deleteMedia(newMedia);
      }
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findDeletedRepostByRepostDto(
    repostInfo: IRepostRequestDto,
    session?: ClientSession
  ): Promise<IPost | null> {
    const repost = await postRepository.findRepostByRepostDto(
      repostInfo,
      session
    );

    if (repost && !repost.isDeleted) {
      throw new ConflictError("재게시 중복");
    }

    return repost && repost.isDeleted ? repost : null;
  }

  async findRepostByRepostDto(
    repostDto: IRepostRequestDto,
    session?: ClientSession
  ): Promise<IPost> {
    const repost = await postRepository.findRepostByRepostDto(
      repostDto,
      session
    );

    if (!repost) {
      throw new NotFoundError("재게시 조회 실패");
    }

    return repost;
  }

  async createRepost(
    repost: IRepostRequestDto,
    session?: ClientSession
  ): Promise<IPostResponseDto> {
    const newRepost = await postRepository.createRepost(repost, session);

    if (!newRepost) {
      throw new InternalServerError(
        "Failed to create repost. (리포스트 생성 실패)",
        "REPOST_CREATION_ERROR",
        {
          repost: "REPOST_CREATION_FAILED",
        }
      );
    }

    return newRepost;
  }

  async toggleRepost(
    postId: Types.ObjectId,
    isDeleting: boolean,
    session?: ClientSession
  ): Promise<void> {
    const result = await postRepository.toggleRepost(
      postId,
      isDeleting,
      session
    );

    if (!result) {
      throw new InternalServerError("ㄹ포스트 토글 도중 에러 발생");
    }

    if (result.matchedCount === 0) {
      throw new NotFoundError("포스트를 찾을 수 없습니다.");
    }

    if (result.modifiedCount === 0) {
      throw new InternalServerError("리포스트 토글 실패");
    }
  }

  async increaseRepost(postId: Types.ObjectId, session?: ClientSession) {
    const result = await postRepository.increaseRepost(postId, session);

    if (!result) {
      throw new InternalServerError("리포스트 카운트 증가 도중 에러 발생");
    }

    if (result?.matchedCount === 0) {
      throw new NotFoundError("오리지널 포스트를 찾을 수 없음");
    }

    if (result?.modifiedCount === 0) {
      throw new InternalServerError("리포스트 카운트 증가 실패");
    }
  }

  // repost 생성
  async createAndAddRepost(repostDto: IRepostRequestDto) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 해당 postId와 userId를 통해서 리포스트한 것이 있는지 조회
      let repost = await this.findDeletedRepostByRepostDto(repostDto, session);

      let newPost: IPostResponseDto;
      // repost가 존재하고 isDeleted: true : 토글
      if (repost) {
        // isDeleted, deletedAt 변경
        await this.toggleRepost(repost._id, false, session);

        // repost의 IPostResponseDto 반환
        newPost = await this.getPostById(repost._id, repostDto.author, session);
      } else {
        // repost가 없는 경우 : 생성
        // 리포스트 생성
        newPost = await this.createRepost(repostDto, session);
      }

      // 원본 포스트 actions.reposts 업데이트
      await this.increaseRepost(repostDto.originalPostId, session);

      await session.commitTransaction();
      return newPost;
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async decreaseRepost(postId: Types.ObjectId, session?: ClientSession) {
    const result = await postRepository.decreaseRepost(postId, session);

    if (!result) throw new InternalServerError("리포스트 삭제 중 에러 발생");

    if (result.matchedCount === 0) throw new NotFoundError("포스트 조회 실패");

    if (result.modifiedCount === 0)
      throw new InternalServerError("리포스트 삭제 실패");
  }

  async deleteRepostByPostIdAndUserId(
    originalPostId: Types.ObjectId,
    author: Types.ObjectId,
    session?: ClientSession
  ): Promise<IPost> {
    const repostDto: IRepostRequestDto = {
      originalPostId,
      author,
      type: "repost",
      repostedPostId: originalPostId,
    };

    const repost = await this.findRepostByRepostDto(repostDto, session);

    await this.toggleRepost(repost._id, true, session);

    return repost;
  }

  async deleteAndRemoveRepost(
    postId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<IPost> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const repost = await this.deleteRepostByPostIdAndUserId(
        postId,
        userId,
        session
      );

      await this.decreaseRepost(postId, session);

      await session.commitTransaction();

      return repost;
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteRepostById(
    postId: Types.ObjectId,
    originalPostId: Types.ObjectId
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 해당 포스트 삭제
      await this.deletePost(postId, session);

      // 원본 포스트의 actions.reposts 감소
      await this.decreaseRepost(originalPostId, session);

      await session.commitTransaction();
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getPostsByCurrentUser(
    userIds: Types.ObjectId[],
    skip: number
  ): Promise<IPostResponseDto[]> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const posts = await postRepository.getPostsByCurrentUser(
        userIds,
        skip,
        session
      );

      await session.commitTransaction();

      return posts;
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getPostsAndRepliesByCurrentUser(
    userIds: Types.ObjectId[],
    skip: number
  ): Promise<IPostResponseDto[]> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const posts = await postRepository.getPostsAndRepliesByCurrentUser(
        userIds,
        skip,
        session
      );

      await session.commitTransaction();

      return posts;
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getMediaByCurrentUser(
    userId: Types.ObjectId
  ): Promise<IPostResponseDto[]> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const posts = await postRepository.getMediaByCurrentUser(userId, session);
      await session.commitTransaction();

      return posts;
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getPostsByKeyword(keyword: string, pageNum: number) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const posts = await postRepository.getPostsByKeyword(
        keyword,
        pageNum,
        session
      );
      await session.commitTransaction();

      return posts;
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default new PostService();
