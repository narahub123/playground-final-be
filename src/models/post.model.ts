import { IPost, IVoteOption } from "@types";
import mongoose from "mongoose";

const VoteOptionSchema = new mongoose.Schema<IVoteOption>(
  {
    option: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  { _id: false }
);

const PostSchema = new mongoose.Schema<IPost>(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    media: {
      type: [String],
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
