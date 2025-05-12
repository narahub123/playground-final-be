import { Router } from "express";
import { authTokenMiddleware } from "@middlewares";
import {
  createComment,
  createQuote,
  creatNewPost,
  deletePost,
  deleteRepost,
  getComments,
  getPostById,
  getPostPreview,
  getPostsByUserAndFollowings,
  updateBookmarks,
  updateLikes,
  updatePin,
  updatePostVote,
  createRepost,
} from "@controllers";

export default (router: Router) => {
  router.get("/posts/me/feed", authTokenMiddleware, getPostsByUserAndFollowings);
  router.post("/posts", authTokenMiddleware, creatNewPost);
  router.get("/posts/preview", authTokenMiddleware, getPostPreview);
  router.get("/posts/:postid/comments", authTokenMiddleware, getComments);
  router.post("/posts/:postid/quote", authTokenMiddleware, createQuote);
  router.get("/posts/:postid", authTokenMiddleware, getPostById);
  router.post("/posts/:postid/repost", authTokenMiddleware, createRepost);
  router.post("/posts/:postid/comment", authTokenMiddleware, createComment);
  router.patch("/posts/:postId/likes", authTokenMiddleware, updateLikes);
  router.patch(
    "/posts/:postid/bookmarks",
    authTokenMiddleware,
    updateBookmarks
  );
  router.patch("/posts/:postid/pin", authTokenMiddleware, updatePin);
  router.post(
    `/posts/:postId/vote/:optionIndex`,
    authTokenMiddleware,
    updatePostVote
  );
  router.delete("/posts/:postid/repost", authTokenMiddleware, deleteRepost);
  router.delete("/posts/:postid", authTokenMiddleware, deletePost);
};
