import { BadRequestError } from "@errors";
import { asyncWrapper } from "@middlewares";
import { searchHistoryService } from "@services";
import { IApiSuccessResponse } from "@types";
import { Request, Response } from "express";

class SearchHistoryController {
  async getSearchHistory(req: Request, res: Response) {
    const { _id: userId, savedSearches } = req.user;

    const recentSearches = await searchHistoryService.getRecentSearches(userId);

    const searchHistory = {
      recentSearches,
      savedSearches: savedSearches || [],
    };

    const response: IApiSuccessResponse<Record<string, any>> = {
      success: true,
      message: "Posts were retrieved successfully. (포스트 목록 조회 성공)",
      code: "POSTS_RETRIEVAL_SUCCESS",
      data: { searchHistory },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  }

  async getAutoCompleteKeywords(req: Request, res: Response) {
    const { keyword } = req.query;

    if (!keyword) {
      throw new BadRequestError("keyword 필수");
    }

    const autoComplete = await searchHistoryService.getAutoCompleteByKeyword(
      keyword.toString()
    );

    const response: IApiSuccessResponse<Record<string, any>> = {
      success: true,
      message:
        "Auto-complete keywords were retrieved successfully.(검색어 자동완성 조회 성공)",
      code: "AUTOCOMPLETE_SUCCEEDED",
      data: { autoComplete },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  }

  async deleteRecentKeyword(req: Request, res: Response) {
    const { _id: userId } = req.user;
    const { keyword } = req.query;

    if (!keyword) {
      throw new BadRequestError("keyword 필수");
    }

    await searchHistoryService.deleteRecentKeyword(userId, keyword.toString());

    const response: IApiSuccessResponse = {
      success: true,
      message: "Keyword is deleted successfully.(검색어 자동완성 조회 성공)",
      code: "RECENT_KEYWORD_DELETION_SUCCEEDED",
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  }
}

export default new SearchHistoryController();
