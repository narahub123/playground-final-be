import { IRepost } from "@types";
import mongoose, { Schema } from "mongoose";

const RepostSchema = new mongoose.Schema<IRepost>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: false,
    },
    pin: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

RepostSchema.index({ post: 1, user: 1 }, { unique: true });

const Repost = mongoose.model<IRepost>("Repost", RepostSchema);

export default Repost;
