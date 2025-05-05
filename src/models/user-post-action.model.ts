import { IUserPostAction } from "@types";
import mongoose, { Schema } from "mongoose";

const UserPostActionSchema = new mongoose.Schema<IUserPostAction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "bookmark"],
      required: true,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

UserPostActionSchema.index({ userId: 1, postId: 1, type: 1 });

const UserPostAction = mongoose.model("UserPostAction", UserPostActionSchema);

export default UserPostAction;
