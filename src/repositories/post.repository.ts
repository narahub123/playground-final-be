import { Post } from "@models";
import {
  IPost,
  IPostRequestDto,
  IPostResponseDto,
  IRepostRequestDto,
} from "@types";
import { mongoDBErrorHandler } from "@utils";
import mongoose, {
  ClientSession,
  DeleteResult,
  Types,
  UpdateResult,
  UpdateWriteOpResult,
} from "mongoose";

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

  async createRepost(
    post: IRepostRequestDto,
    session: ClientSession
  ): Promise<IPostResponseDto | null> {
    try {
      const newPost = await Post.create([post], { session });

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

          // 2. originalPost가 있는 경우에만 연결
          {
            $lookup: {
              from: "posts",
              let: { originalId: "$originalPostId" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$originalId"] } } },
                {
                  $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "originalPostAuthor",
                  },
                },
                { $unwind: "$originalPostAuthor" },
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
                      _id: "$originalPostAuthor._id",
                      userId: "$originalPostAuthor.userId",
                      username: "$originalPostAuthor.username",
                      profileImage: "$originalPostAuthor.profileImage",
                    },
                  },
                },
              ],
              as: "originalPost",
            },
          },
          {
            $addFields: {
              originalPost: { $arrayElemAt: ["$originalPost", 0] }, // optional 처리
            },
          },

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
              originalPost: 1, // 없으면 null
            },
          },
        ],
        { session }
      );

      return posts[0] || null;
    } catch (error) {
      mongoDBErrorHandler("createRepost", error, { post });
      return null;
    }
  }

  async getPostsByAuthor(
    authorId: mongoose.Types.ObjectId
  ): Promise<IPostResponseDto[]> {
    try {
      const posts = await Post.aggregate<IPostResponseDto>([
        { $match: { author: authorId } },

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

        // 2. originalPost가 있는 경우에만 연결
        {
          $lookup: {
            from: "posts",
            let: { originalId: "$originalPostId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$originalId"] } } },
              {
                $lookup: {
                  from: "users",
                  localField: "author",
                  foreignField: "_id",
                  as: "originalPostAuthor",
                },
              },
              { $unwind: "$originalPostAuthor" },
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
                    _id: "$originalPostAuthor._id",
                    userId: "$originalPostAuthor.userId",
                    username: "$originalPostAuthor.username",
                    profileImage: "$originalPostAuthor.profileImage",
                  },
                },
              },
            ],
            as: "originalPost",
          },
        },
        {
          $addFields: {
            originalPost: { $arrayElemAt: ["$originalPost", 0] }, // optional 처리
          },
        },

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
            originalPost: 1, // 없으면 null
          },
        },

        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      return posts;
    } catch (error) {
      mongoDBErrorHandler("getPostsByAuthor", error, { user_id: authorId });
      return [];
    }
  }

  async getPostById(
    _id: Types.ObjectId
  ): Promise<IPostResponseDto | undefined> {
    try {
      const post = await Post.findById(_id);

      const posts = await Post.aggregate<IPostResponseDto>([
        { $match: { _id: post?._id } },

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

        // 2. originalPost가 있는 경우에만 연결
        {
          $lookup: {
            from: "posts",
            let: { originalId: "$originalPostId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$originalId"] } } },
              {
                $lookup: {
                  from: "users",
                  localField: "author",
                  foreignField: "_id",
                  as: "originalPostAuthor",
                },
              },
              { $unwind: "$originalPostAuthor" },
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
                    _id: "$originalPostAuthor._id",
                    userId: "$originalPostAuthor.userId",
                    username: "$originalPostAuthor.username",
                    profileImage: "$originalPostAuthor.profileImage",
                  },
                },
              },
            ],
            as: "originalPost",
          },
        },
        {
          $addFields: {
            originalPost: { $arrayElemAt: ["$originalPost", 0] }, // optional 처리
          },
        },

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
            originalPost: 1, // 없으면 null
          },
        },
      ]);

      return posts[0];
    } catch (error) {
      mongoDBErrorHandler("getPostById", error, { _id });
      return undefined;
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
    userId: Types.ObjectId
  ): Promise<UpdateResult | undefined> {
    try {
      const result = await Post.updateOne(
        { _id: postId },
        { $addToSet: { [`actions.likes`]: userId } }
      );

      return result;
    } catch (error) {
      mongoDBErrorHandler("addLike", error, {
        postId,
        userId,
      });
      return undefined;
    }
  }

  async deleteLike(
    postId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<UpdateResult | undefined> {
    try {
      const result = await Post.updateOne(
        { _id: postId },
        { $pull: { [`actions.likes`]: userId } }
      );

      return result;
    } catch (error) {
      mongoDBErrorHandler("deleteLike", error, {
        postId,
        userId,
      });
      return undefined;
    }
  }

  async deletePost(
    postId: Types.ObjectId,
    session: ClientSession
  ): Promise<IPost | null> {
    try {
      const post = await Post.findOneAndDelete({ _id: postId }).session(
        session
      );

      return post;
    } catch (error) {
      mongoDBErrorHandler("deleteLike", error, {
        postId,
      });
      return null;
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

  async addRepost(
    postId: Types.ObjectId,
    userId: Types.ObjectId,
    session: ClientSession
  ): Promise<UpdateResult | undefined> {
    try {
      const result = await Post.updateOne(
        { _id: postId },
        {
          $addToSet: {
            ["actions.reposts"]: userId,
          },
        }
      ).session(session);

      return result;
    } catch (error) {
      mongoDBErrorHandler("addRepost", error, {
        postId,
        userId,
      });
      return undefined;
    }
  }

  async removeRepost(
    postId: Types.ObjectId,
    userId: Types.ObjectId,
    session: ClientSession
  ): Promise<UpdateResult | undefined> {
    try {
      const result = await Post.updateOne(
        { _id: postId },
        { $pull: { [`actions.reposts`]: userId } }
      ).session(session);

      return result;
    } catch (error) {
      mongoDBErrorHandler("removeRepost", error, {
        postId,
        userId,
      });
      return undefined;
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
}

export default new PostRepository();
