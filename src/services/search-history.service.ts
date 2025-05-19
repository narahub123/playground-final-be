import { InternalServerError } from "@errors";
import { searchHistoryRepository } from "@repositories";
import { ClientSession, Types } from "mongoose";

class SearchHistoryService {
  async createSearchHistory(
    userId: Types.ObjectId,
    query: string,
    session?: ClientSession
  ) {
    const sh = await searchHistoryRepository.createSearchHistory(
      userId,
      query,
      session
    );

    if (!sh) {
      throw new InternalServerError("검색 기록 생성 중 에러 발생");
    }
  }

  async getRecentSearches(userId: Types.ObjectId): Promise<string[]> {
    const recentSearches = await searchHistoryRepository.getRecentSearches(
      userId
    );

    return recentSearches;
  }

  async getSearchHistory(userId: Types.ObjectId): Promise<Record<string, any>> {
    const recentSearches = await this.getRecentSearches(userId);

    return { recentSearches, savedSearches: [] };
  }
}

export default new SearchHistoryService();
