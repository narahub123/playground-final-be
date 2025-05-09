import { Post } from "@models";
import {
  ICommentRequestDto,
  IPost,
  IPostRequestDto,
  IPostResponseDto,
  IQuoteRequestDto,
  IRepostRequestDto,
} from "@types";
import {
  aggregateCommentsByPostId,
  aggregatePostById,
  aggregatePostsByUserAndFollowings,
  aggregatePostsByUserId,
  mongoDBErrorHandler,
} from "@utils";
import mongoose, {
  ClientSession,
  Types,
  UpdateResult,
  UpdateWriteOpResult,
} from "mongoose";

class PostRepository {
  async createPost(
    post: IPostRequestDto,
    options?: { session: mongoose.ClientSession }
  ): Promise<IPostResponseDto | undefined> {
    try {
      const newPost = await Post.create([post], options);

      if (!newPost[0]) return undefined;

      const newOne = await aggregatePostById(
        newPost[0]._id,
        post.author,
        options?.session
      );

      return newOne;
    } catch (error) {
      mongoDBErrorHandler("createPost", error, { post });
    }
  }

  async createComment(
    comment: ICommentRequestDto,
    session?: ClientSession
  ): Promise<IPostResponseDto | null> {
    try {
      const newPost = await Post.create([comment], { session });

      const posts = await Post.aggregate<IPostResponseDto>(
        [
          { $match: { _id: newPost[0]?._id } },

          // 1. 작성자 정보
          {
            $lookup: {
              from: "users",
              localField: "author",
              foreignField: "_id",
              as: "postAuthor",
            },
          },
          { $unwind: "$postAuthor" },

          // 3. 최종 결과 구성
          {
            $project: {
              _id: 1,
              type: 1,
              text: 1,
              media: 1,
              schedule: 1,
              vote: 1,
              actions: 1,
              pin: 1,
              createdAt: 1,
              updatedAt: 1,
              author: {
                _id: "$postAuthor._id",
                userId: "$postAuthor.userId",
                username: "$postAuthor.username",
                profileImage: "$postAuthor.profileImage",
              },
              originalPostId: 1, // 없으면 null
            },
          },
        ],
        { session }
      );

      return posts[0] || null;
    } catch (error) {
      mongoDBErrorHandler("createComment", error, { comment });
      return null;
    }
  }

  // 사용자와 사용자의 팔로잉의 포스트 목록
  async getPostsByAuthorAndFollowings(
    authorIds: Types.ObjectId[],
    skip: number,
    session?: ClientSession
  ): Promise<IPostResponseDto[]> {
    try {
      const posts = await aggregatePostsByUserAndFollowings(
        authorIds,
        skip,
        session
      );

      return posts;
    } catch (error) {
      mongoDBErrorHandler("getPostsByAuthorAndFollowings", error, {
        user_id: authorIds,
      });
      return [];
    }
  }

  // 사용자의 포스트 목록
  async getPostsByAuthor(
    authorId: mongoose.Types.ObjectId
  ): Promise<IPostResponseDto[]> {
    try {
      const posts = await aggregatePostsByUserId(authorId);

      return posts;
    } catch (error) {
      mongoDBErrorHandler("getPostsByAuthor", error, { user_id: authorId });
      return [];
    }
  }

  async getPostById(
    postId: Types.ObjectId,
    userId: Types.ObjectId,
    session?: ClientSession
  ): Promise<IPostResponseDto | undefined> {
    try {
      const post = await aggregatePostById(postId, userId, session);

      return post;
    } catch (error) {
      mongoDBErrorHandler("getPostById", error, { postId });
      return undefined;
    }
  }

  async getPurePostById(
    postId: Types.ObjectId,
    session?: ClientSession
  ): Promise<IPost | null> {
    try {
      const post = session
        ? await Post.findById(postId).session(session)
        : await Post.findById(postId);

      return post;
    } catch (error) {
      mongoDBErrorHandler("getPurePostById", error, {
        postId,
      });
      return null;
    }
  }

  async updatePostVoteWithUserId(
    postId: Types.ObjectId,
    userId: Types.ObjectId,
    optionIndex: number
  ): Promise<UpdateWriteOpResult | null> {
    try {
      const result = await Post.updateOne(
        { _id: postId },
        { $addToSet: { [`vote.options.${optionIndex}.voters`]: userId } }
      );

      return result;
    } catch (error) {
      mongoDBErrorHandler("updatePostVoteWithUserId", error, {
        postId,
        userId,
        optionIndex,
      });
      return null;
    }
  }

  async addView(postId: Types.ObjectId): Promise<UpdateResult | undefined> {
    try {
      const result = await Post.updateOne(
        { _id: postId },
        { $inc: { "actions.views": 1 } }
      );

      return result;
    } catch (error) {
      mongoDBErrorHandler("addView", error, {
        postId,
      });
      return undefined;
    }
  }

  async addLike(
    postId: Types.ObjectId,
    session?: ClientSession
  ): Promise<UpdateResult | undefined> {
    try {
      const updateQuery = Post.updateOne(
        { _id: postId },
        {
          $inc: { "actions.likes": 1 },
        }
      );
      const result = session
        ? await updateQuery.session(session)
        : await updateQuery;

      return result;
    } catch (error) {
      mongoDBErrorHandler("addLike", error, {
        postId,
      });
      return undefined;
    }
  }

  async removeLike(postId: Types.ObjectId, session?: ClientSession) {
    try {
      const updateQuery = Post.updateOne(
        {
          _id: postId,
        },
        {
          $inc: {
            "actions.likes": -1,
          },
        }
      );

      const result = session
        ? await updateQuery.session(session)
        : await updateQuery;

      return result;
    } catch (error) {
      mongoDBErrorHandler("deleteLike", error, {
        postId,
      });
      return undefined;
    }
  }

  async setLikeCount(
    postId: Types.ObjectId,
    count: number,
    session?: ClientSession
  ): Promise<UpdateResult | undefined> {
    try {
      const updateQuery = Post.updateOne(
        { _id: postId },
        { $set: { "actions.likes": count } }
      );

      const result = session
        ? await updateQuery.session(session)
        : await updateQuery;

      return result;
    } catch (error) {
      mongoDBErrorHandler("setLikeCount", error, { postId, count });
    }
  }

  async addBookmark(
    postId: Types.ObjectId,
    session?: ClientSession
  ): Promise<UpdateResult | undefined> {
    try {
      const updateQuery = Post.updateOne(
        { _id: postId },
        {
          $inc: { "actions.bookmarks": 1 },
        }
      );
      const result = session
        ? await updateQuery.session(session)
        : await updateQuery;

      return result;
    } catch (error) {
      mongoDBErrorHandler("addBookmark", error, {
        postId,
      });
      return undefined;
    }
  }

  async removeBookmark(postId: Types.ObjectId, session?: ClientSession) {
    try {
      const updateQuery = Post.updateOne(
        {
          _id: postId,
        },
        {
          $inc: {
            "actions.bookmarks": -1,
          },
        }
      );

      const result = session
        ? await updateQuery.session(session)
        : await updateQuery;

      return result;
    } catch (error) {
      mongoDBErrorHandler("removeBookmark", error, {
        postId,
      });
      return undefined;
    }
  }

  async setBookmarkCount(
    postId: Types.ObjectId,
    count: number,
    session?: ClientSession
  ): Promise<UpdateResult | undefined> {
    try {
      const updateQuery = Post.updateOne(
        { _id: postId },
        { $set: { "actions.bookmarks": count } }
      );

      const result = session
        ? await updateQuery.session(session)
        : await updateQuery;

      return result;
    } catch (error) {
      mongoDBErrorHandler("setBookmarkCount", error, { postId, count });
    }
  }

  async removeComment(postId: Types.ObjectId, session?: ClientSession) {
    try {
      const updateQuery = Post.updateOne(
        {
          _id: postId,
        },
        {
          $inc: {
            "actions.comments": -1,
          },
        }
      );

      const result = session
        ? await updateQuery.session(session)
        : await updateQuery;

      return result;
    } catch (error) {
      mongoDBErrorHandler("removeComment", error, {
        postId,
      });
      return undefined;
    }
  }

  async deletePost(
    postId: Types.ObjectId,
    session?: ClientSession
  ): Promise<UpdateResult | undefined> {
    try {
      const updateQuery = Post.updateOne(
        { _id: postId },
        { isDeleted: true, deletedAt: new Date() }
      );

      const result = session
        ? await updateQuery.session(session)
        : await updateQuery;

      return result;
    } catch (error) {
      mongoDBErrorHandler("deleteLike", error, {
        postId,
      });
    }
  }

  async deleteOriginalPostByPostId(
    postId: Types.ObjectId,
    session?: ClientSession
  ): Promise<UpdateResult | undefined> {
    try {
      const result = await Post.updateMany(
        {
          originalPostId: postId,
          isOriginalPostDeleted: { $ne: true },
        },
        { $set: { isOriginalPostDeleted: true } },
        { session }
      );

      return result;
    } catch (error) {
      mongoDBErrorHandler("deleteOriginalPostByPostId", error, {
        postId,
      });
      return undefined;
    }
  }

  async updatePin(postId: Types.ObjectId): Promise<UpdateResult | undefined> {
    try {
      return await Post.updateOne({ _id: postId }, [
        { $set: { pin: { $not: "$pin" } } },
      ]);
    } catch (error) {
      mongoDBErrorHandler("updatePin", error, { postId });
      return undefined;
    }
  }

  async getRepostByRepostInfo(
    repostInfo: IRepostRequestDto,
    session?: ClientSession
  ): Promise<IPost | null> {
    try {
      const repost = await Post.findOne(
        {
          originalPostId: repostInfo.originalPostId,
          type: "repost",
          userId: repostInfo.author,
        },
        null,
        { session }
      );

      return repost;
    } catch (error) {
      mongoDBErrorHandler("getRepostByRepostInfo", error, {
        repostInfo,
      });
      return null;
    }
  }

  async getRepostsByOriginalPostId(
    postId: Types.ObjectId,
    session?: ClientSession
  ): Promise<IPost[]> {
    try {
      const reposts = session
        ? await Post.find({ originalPostId: postId }).session(session)
        : await Post.find({ originalPostId: postId });

      return reposts;
    } catch (error) {
      mongoDBErrorHandler("getRepostsByOriginalPostId", error, {
        postId,
      });
      return [];
    }
  }

  async addComment(
    postId: Types.ObjectId,
    commentId: Types.ObjectId,
    session?: ClientSession
  ): Promise<UpdateResult | undefined> {
    try {
      const updateQuery = Post.updateOne(
        { _id: postId },
        {
          $inc: {
            "actions.comments": 1,
          },
        }
      );
      const result = session
        ? await updateQuery.session(session)
        : await updateQuery;

      return result;
    } catch (error) {
      mongoDBErrorHandler("addComment", error, {
        postId,
        commentId,
      });
      return undefined;
    }
  }

  async getCommentsByPostId(
    originalPostId: Types.ObjectId,
    skip: number,
    session?: ClientSession
  ): Promise<IPostResponseDto[]> {
    try {
      const comments = await aggregateCommentsByPostId(
        originalPostId,
        skip,
        session
      );

      return comments;
    } catch (error) {
      mongoDBErrorHandler("getCommentsByPostId", error, {
        originalPostId,
      });
      throw error;
    }
  }

  async createQuote(
    newQuote: IQuoteRequestDto,
    session?: ClientSession
  ): Promise<IPostResponseDto | undefined> {
    try {
      const newPost = await Post.create([newQuote], { session });

      if (!newPost[0]) return undefined;

      const quote = await aggregatePostById(
        newPost[0]._id,
        newQuote.author,
        session
      );

      return quote;
    } catch (error) {
      mongoDBErrorHandler("createQuote", error, {
        newQuote,
      });
      return undefined;
    }
  }

  async createRepost(
    post: IRepostRequestDto,
    session?: ClientSession
  ): Promise<IPostResponseDto | undefined> {
    try {
      const newPost = await Post.create([post], { session });

      if (!newPost[0]) return undefined;

      const repost = await aggregatePostById(
        newPost[0]._id,
        post.author,
        session
      );

      return repost;
    } catch (error) {
      mongoDBErrorHandler("createRepost", error, { post });
      return undefined;
    }
  }

  async findRepostByRepostDto(
    repostDto: IRepostRequestDto,
    session?: ClientSession
  ): Promise<IPost | null> {
    try {
      const { type, originalPostId, author } = repostDto;

      const searchQuery = Post.findOne({ type, originalPostId, author });

      const repost = session
        ? await searchQuery.session(session)
        : await searchQuery;

      console.log("찾은 repost", repost);

      return repost;
    } catch (error) {
      mongoDBErrorHandler("findRepostByPostIdAndUserId", error, {
        repostDto,
      });
      return null;
    }
  }

  async toggleRepost(
    postId: Types.ObjectId,
    isDeleting: boolean,
    session?: ClientSession
  ): Promise<UpdateResult | undefined> {
    try {
      const result = await Post.updateOne(
        { _id: postId },
        { isDeleted: isDeleting, deletedAt: isDeleting ? new Date() : null },
        { session }
      );

      return result;
    } catch (error) {
      mongoDBErrorHandler("updateRepost", error, { postId });
      return undefined;
    }
  }

  async increaseRepost(
    postId: Types.ObjectId,
    session?: ClientSession
  ): Promise<UpdateResult | undefined> {
    try {
      const updateQuery = Post.updateOne(
        { _id: postId },
        {
          $inc: {
            "actions.reposts": 1,
          },
        }
      );
      const result = session
        ? await updateQuery.session(session)
        : await updateQuery;

      return result;
    } catch (error) {
      mongoDBErrorHandler("increaseRepost", error, {
        postId,
      });
      return undefined;
    }
  }

  async decreaseRepost(
    postId: Types.ObjectId,
    session?: ClientSession
  ): Promise<UpdateResult | undefined> {
    try {
      const result = await Post.updateOne(
        {
          _id: postId,
        },
        {
          $inc: {
            "actions.reposts": -1,
          },
        },
        { session }
      );

      return result;
    } catch (error) {
      mongoDBErrorHandler("removeBookmark", error, {
        postId,
      });
      return undefined;
    }
  }

  async deleteRepostByPostIdAndUserId(
    originalPostId: Types.ObjectId,
    userId: Types.ObjectId,
    session?: ClientSession
  ): Promise<IPost | null> {
    try {
      const repost = await Post.findOneAndUpdate(
        { originalPostId, author: userId, isDeleted: false },
        { isDeleted: true, deletedAt: new Date() },
        { session }
      );

      console.log(repost);

      return repost;
    } catch (error) {
      mongoDBErrorHandler("deleteRepostByPostIdAndUserId", error, {
        originalPostId,
        userId,
      });
      return null;
    }
  }
}

export default new PostRepository();
