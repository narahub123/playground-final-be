import { ISearchHistory } from "@types";
import mongoose, { Schema } from "mongoose";

const SearchHistorySchema = new mongoose.Schema<ISearchHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    query: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

SearchHistorySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 * 6 }
); // 6개월

const SearchHistory = mongoose.model("SearchHistory", SearchHistorySchema);

export default SearchHistory;
