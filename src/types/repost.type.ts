import { Document, Types } from "mongoose";

interface IRepost extends Document {
  _id: Types.ObjectId;
  post: Types.ObjectId;
  user: Types.ObjectId;
  text?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type { IRepost };
