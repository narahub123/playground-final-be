import { Document, Types } from "mongoose";

interface ISearchHistory extends Document {
  userId: Types.ObjectId;
  query: string;
}

export { ISearchHistory };
