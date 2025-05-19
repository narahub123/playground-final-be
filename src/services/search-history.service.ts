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
}

export default new SearchHistoryService();
