import { Router } from "express";
import { authTokenMiddleware } from "@middlewares";
import { deleteRepost } from "@controllers";

export default (router: Router) => {
  router.delete("/reposts/:repostid", authTokenMiddleware, deleteRepost);
};
