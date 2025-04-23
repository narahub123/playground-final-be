import { Router } from "express";
import { authTokenMiddleware } from "@middlewares";
import { deleteRepost, updateRepostPin } from "@controllers";

export default (router: Router) => {
  router.delete("/reposts/:repostid", authTokenMiddleware, deleteRepost);
  router.patch("/reposts/:repostid/pin", authTokenMiddleware, updateRepostPin);
};
