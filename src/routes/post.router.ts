import { Router } from "express";
import { authTokenMiddleware } from "@middlewares";
import { creatNewPost } from "@controllers";

export default (router: Router) => {
  router.post("/posts", authTokenMiddleware, creatNewPost);
};
