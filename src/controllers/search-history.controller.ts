import { searchHistoryService } from "@services";
import { IApiSuccessResponse } from "@types";
import { Request, Response } from "express";

class SearchHistoryController {
  async getSearchHistory(req: Request, res: Response) {
    const { _id: userId } = req.user;

    const searchHistory = await searchHistoryService.getSearchHistory(userId);

    const response: IApiSuccessResponse<Record<string, any>> = {
      success: true,
      message: "Posts were retrieved successfully. (포스트 목록 조회 성공)",
      code: "POSTS_RETRIEVAL_SUCCESS",
      data: { searchHistory },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  }
}

export default new SearchHistoryController();
