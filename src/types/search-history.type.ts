import { Document, Types } from "mongoose";

interface ISearchHistory extends Document {
  userId: Types.ObjectId;
  query: string;
  isDeleted: boolean;
}

export { ISearchHistory };
