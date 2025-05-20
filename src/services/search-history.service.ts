import { InternalServerError } from "@errors";
import { searchHistoryRepository } from "@repositories";
import { ClientSession, Types } from "mongoose";
import userService from "./user.service";
import { IAuthor } from "@types";

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

  async getAutoCompleteKeywords(keyword: string) {
    const keywords = await searchHistoryRepository.getKeywordAutoComplete(
      keyword
    );

    return keywords;
  }

  async getAutoCompleteByKeyword(keyword: string): Promise<{
    popularKeywords: string[];
    users: IAuthor[];
  }> {
    const popularKeywords = await this.getAutoCompleteKeywords(keyword);
    const users = await userService.getUsersByKeyword(keyword);

    return {
      popularKeywords,
      users,
    };
  }
}

export default new SearchHistoryService();
