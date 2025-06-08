import {
  checkEmailDuplication,
  checkPhoneDuplication,
  checkUserIdDuplication,
  getContactsBeforeLogin,
  getCurrentUser,
  addCountGroup,
  swtichAccount,
  changePassword,
  updateMe,
  clearRecentEmojis,
  getUserInfo,
  getPostsByUserId,
} from "@controllers";
import { authTokenMiddleware } from "@middlewares";
import { Router } from "express";

export default (router: Router) => {
  router.get("/users/:userid/articles", authTokenMiddleware, getPostsByUserId);
  router.get("/users/me", authTokenMiddleware, getCurrentUser);
  router.get("/users/:userId", authTokenMiddleware, getUserInfo);
  router.post("/users/check-duplication/email", checkEmailDuplication);
  router.post("/users/check-duplication/phone", checkPhoneDuplication);
  router.post("/users/check-duplication/userid", checkUserIdDuplication);
  router.post("/users/contacts", getContactsBeforeLogin);
  router.post("/users/account-group", authTokenMiddleware, addCountGroup);
  router.post("/users/switch", authTokenMiddleware, swtichAccount);
  router.patch("/users/password", authTokenMiddleware, changePassword);
  router.patch("/users/me", authTokenMiddleware, updateMe);
  router.delete("/users/recent-emojis", authTokenMiddleware, clearRecentEmojis);
};
