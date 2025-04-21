import { Router } from "express";
import { authTokenMiddleware } from "@middlewares";
import { creatNewPost, getPostPreview, updatePostVote } from "@controllers";

export default (router: Router) => {
  router.post("/posts", authTokenMiddleware, creatNewPost);
  router.get("/posts/preview", authTokenMiddleware, getPostPreview);
  router.post(
    `/posts/:postId/:optionIndex`,
    authTokenMiddleware,
    updatePostVote
  );
};
