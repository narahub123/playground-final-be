import { SearchHistory } from "@models";
import { ISearchHistory } from "@types";
import { mongoDBErrorHandler } from "@utils";
import { ClientSession, Types } from "mongoose";

class SearchHistoryRepository {
  async createSearchHistory(
    userId: Types.ObjectId,
    query: string,
    session?: ClientSession
  ): Promise<ISearchHistory | undefined> {
    try {
      const newSearchHisotry = await SearchHistory.create(
        [
          {
            userId,
            query,
          },
        ],
        { session }
      );

      return newSearchHisotry[0] || undefined;
    } catch (error) {
      mongoDBErrorHandler("createSearchHistory", error, {
        userId,
        query,
      });
    }
  }
}

export default new SearchHistoryRepository();
