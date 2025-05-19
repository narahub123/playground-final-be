import { searchHistoryController } from "@controllers";
import { authTokenMiddleware } from "@middlewares";
import { Router } from "express";

export default (router: Router) => {
  router.get(
    "/search-history/me",
    authTokenMiddleware,
    searchHistoryController.getSearchHistory
  );
};
