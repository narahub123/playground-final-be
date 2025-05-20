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
};
