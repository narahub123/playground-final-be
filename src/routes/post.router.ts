import { Router } from "express";
import { authTokenMiddleware } from "@middlewares";
import {
  addRepost,
  createComment,
  creatNewPost,
  deletePost,
  getComments,
  getPostById,
  getPostPreview,
  updateBookmarks,
  updateLikes,
  updatePin,
  updatePostVote,
} from "@controllers";

export default (router: Router) => {
  router.post("/posts", authTokenMiddleware, creatNewPost);
  router.get("/posts/preview", authTokenMiddleware, getPostPreview);
  router.get("/posts/:postid/comments", authTokenMiddleware, getComments);
  router.get("/posts/:postid", authTokenMiddleware, getPostById);
  router.post("/posts/:postid/repost", authTokenMiddleware, addRepost);
  router.post("/posts/:postid/comment", authTokenMiddleware, createComment);
  router.patch("/posts/:postId/likes", authTokenMiddleware, updateLikes);
  router.patch(
    "/posts/:postid/bookmarks",
    authTokenMiddleware,
    updateBookmarks
  );
  router.patch("/posts/:postid/pin", authTokenMiddleware, updatePin);
  router.post(
    `/posts/:postId/:optionIndex`,
    authTokenMiddleware,
    updatePostVote
  );
  router.delete("/posts/:postId", authTokenMiddleware, deletePost);
};
