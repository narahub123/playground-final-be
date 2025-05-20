import { InternalServerError, NotFoundError } from "@errors";
import { searchHistoryRepository } from "@repositories";
import mongoose, { ClientSession, Types } from "mongoose";
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
    keywordSuggestions: string[];
    userSuggestions: IAuthor[];
  }> {
    const keywordSuggestions = await this.getAutoCompleteKeywords(keyword);
    const userSuggestions = await userService.getUsersByKeyword(keyword);

    return {
      keywordSuggestions,
      userSuggestions,
    };
  }

  async deleteRecentKeyword(userId: Types.ObjectId, keyword: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await searchHistoryRepository.deleteRecentKeyword(
        userId,
        keyword,
        session
      );

      if (!result) {
        throw new InternalServerError("최근 검색어 삭제 중 에러 발생");
      }

      if (result.matchedCount === 0) {
        throw new NotFoundError("최근 검색어를 찾을 수 없음");
      }

      if (result.matchedCount !== 0 && result.modifiedCount === 0) {
        throw new InternalServerError("최근 검색어 삭제 중 에러 발생");
      }

      await session.commitTransaction();
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default new SearchHistoryService();
