import { Document, Types } from "mongoose";

type UserPostActionType = "like" | "bookmark";

interface IUserPostAction extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  type: UserPostActionType;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type { IUserPostAction, UserPostActionType };
