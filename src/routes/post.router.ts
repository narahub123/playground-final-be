import { Router } from "express";
import { authTokenMiddleware } from "@middlewares";
import {
  addRepost,
  creatNewPost,
  getPostPreview,
  updateLikes,
  updatePostVote,
} from "@controllers";

export default (router: Router) => {
  router.post("/posts", authTokenMiddleware, creatNewPost);
  router.get("/posts/preview", authTokenMiddleware, getPostPreview);
  router.post("/posts/:postId/repost", authTokenMiddleware, addRepost);
  router.patch("/posts/:postId/likes", authTokenMiddleware, updateLikes);
  router.post(
    `/posts/:postId/:optionIndex`,
    authTokenMiddleware,
    updatePostVote
  );
};
