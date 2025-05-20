import { searchHistoryController } from "@controllers";
import { asyncWrapper, authTokenMiddleware } from "@middlewares";
import { Router } from "express";

export default (router: Router) => {
  router.get(
    "/search-history/me",
    authTokenMiddleware,
    searchHistoryController.getSearchHistory
  );
  router.get(
    "/search-history/auto-complete",
    authTokenMiddleware,
    asyncWrapper(
      "getAutoCompleteKeywords",
      "Failed to receive autocomplete keywords(검색어 자동완성 조회 실패)",
      "AUTOCOMPLETE_FAILED",
      searchHistoryController.getAutoCompleteKeywords.bind(
        searchHistoryController
      )
    )
  );
  router.delete(
    "/search-history",
    authTokenMiddleware,
    asyncWrapper(
      "deleteRecentKeyword",
      "Failed to delete recent keyword(검색어 자동완성 조회 실패)",
      "RECENT_KEYWORD_DELETION_FAILED",
      searchHistoryController.deleteRecentKeyword.bind(searchHistoryController)
    )
  );
  router.delete(
    "/search-history/all",
    authTokenMiddleware,
    asyncWrapper(
      "deleteAllRecentKeywords",
      "Failed to delete all the recent keyword(검색어 자동완성 조회 실패)",
      "ALL_RECENT_KEYWORD_DELETION_FAILED",
      searchHistoryController.deleteAllRecentKeywords.bind(
        searchHistoryController
      )
    )
  );
};
