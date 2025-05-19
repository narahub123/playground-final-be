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

  async getRecentSearches(userId: Types.ObjectId): Promise<string[]> {
    try {
      const searchHistory = SearchHistory.aggregate<ISearchHistory>([
        {
          $match: { userId, isDeleted: false },
        },
        // 최신순 정렬
        {
          $sort: { createdAt: -1 },
        },
        // query별로 그룹화
        {
          $group: {
            _id: "$query",
            doc: {
              $first: "$$ROOT",
            },
          },
        },
        {
          $sort: {
            "doc.createdAt": -1,
          },
        },
        {
          $limit: 5,
        },
        {
          $project: {
            _id: 0,
            query: "$doc.query",
          },
        },
      ]);

      const recentSearches = (await searchHistory).map((item) => item.query);

      console.log(recentSearches);

      return recentSearches;
    } catch (error) {
      mongoDBErrorHandler("getRecentSearches", error, { userId });
      return [];
    }
  }
}

export default new SearchHistoryRepository();
