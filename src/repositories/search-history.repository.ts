import { SearchHistory } from "@models";
import { ISearchHistory } from "@types";
import { Aggregate, mongoDBErrorHandler } from "@utils";
import { ClientSession, Types, UpdateResult } from "mongoose";

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

  async getKeywordAutoComplete(keyword: string): Promise<string[]> {
    try {
      const keywords = await Aggregate.getAutoCompleteKeywords(keyword);

      return keywords;
    } catch (error) {
      mongoDBErrorHandler("getKeywordAutoComplete", error, {
        keyword,
      });

      return [];
    }
  }

  async deleteRecentKeyword(
    userId: Types.ObjectId,
    keyword: string,
    session?: ClientSession
  ): Promise<UpdateResult | undefined> {
    try {
      const result = await SearchHistory.updateMany(
        {
          userId,
          isDeleted: false,
          query: {
            $regex: `^${keyword}$`,
            $options: "i",
          },
        },
        {
          $set: {
            isDeleted: true,
          },
        },
        { session }
      );

      return result;
    } catch (error) {
      mongoDBErrorHandler("deleteRecentKeyword", error, {
        userId,
        keyword,
      });

      return undefined;
    }
  }
}

export default new SearchHistoryRepository();
