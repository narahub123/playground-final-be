import { IPost, IPostActions, IVoteOption } from "@types";
import mongoose, { Schema } from "mongoose";

const VoteOptionSchema = new mongoose.Schema<IVoteOption>(
  {
    option: { type: String, required: true },
    voters: { type: [Schema.Types.ObjectId], default: [] },
  },
  { _id: false, versionKey: false }
);

const PostActionsSchema = new mongoose.Schema<IPostActions>(
  {
    comments: {
      type: [Schema.Types.ObjectId],
      ref: "Post",
      default: [],
    },
    reposts: {
      type: [Schema.Types.ObjectId],
      ref: "Post",
      default: [],
    },
    likes: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
    bookmarks: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  { _id: false, versionKey: false }
);

const PostSchema = new mongoose.Schema<IPost>(
  {
    type: {
      type: String,
      enum: ["post", "repost", "quote", "comment"],
      default: "post",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: false,
    },
    media: {
      type: [String],
      required: false,
    },
    schedule: {
      type: Date,
      required: false,
    },
    vote: {
      type: new mongoose.Schema(
        {
          options: {
            type: [VoteOptionSchema],
            validate: {
              validator: function (arr: IVoteOption[]) {
                return arr.length >= 2 && arr.length <= 4;
              },
            },
          },
          duration: { type: Date },
        },
        { _id: false }
      ),
      required: false,
    },

    actions: {
      type: PostActionsSchema,
      required: true,
      default: () => ({
        comments: [],
        reposts: [],
        likes: [],
        views: 0,
      }),
    },

    originalPostId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: function (this: IPost) {
        return this.type !== "post";
      },
    },

    repostedAt: {
      type: Date,
      required: function (this: IPost) {
        return this.type === "repost" && !!this.originalPostId;
      },
      default: function (this: IPost) {
        return this.type === "repost" && !!this.originalPostId
          ? new Date()
          : undefined;
      },
    },

    quotedAt: {
      type: Date,
      required: function (this: IPost) {
        return this.type === "quote" && !!this.originalPostId;
      },
      default: function (this: IPost) {
        return this.type === "quote" && !!this.originalPostId
          ? new Date()
          : undefined;
      },
    },

    commentedAt: {
      type: Date,
      required: function (this: IPost) {
        return this.type === "comment" && !!this.originalPostId;
      },
      default: function (this: IPost) {
        return this.type === "comment" && !!this.originalPostId
          ? new Date()
          : undefined;
      },
    },

    pin: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

PostSchema.pre("validate", function (next) {
  const post = this as IPost;

  if (post.vote) {
    if (!post.text) {
      return next(
        new mongoose.Error.ValidationError(
          new Error("투표가 있는 경우 텍스트가 반드시 있어야 함")
        )
      );
    }

    if (post.media && post.media.length > 0) {
      return next(
        new mongoose.Error.ValidationError(
          new Error("투표가 있는 경우 미디어는 있을 수 없음.")
        )
      );
    }
  }

  next();
});

const Post = mongoose.model("Post", PostSchema);

export default Post;
