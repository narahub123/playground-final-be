import {
  loginUser,
  logoutAccount,
  logoutAllAccounts,
  signupUser,
  verifyPassword,
} from "@controllers";
import { authTokenMiddleware } from "@middlewares";
import { Router } from "express";

export default (router: Router) => {
  router.post("/auth/signup", signupUser);
  router.post("/auth/login", loginUser);
  router.post("/auth/logout", authTokenMiddleware, logoutAccount);
  router.post("/auth/logout/all", authTokenMiddleware, logoutAllAccounts);
  router.post("/auth/password/verify", authTokenMiddleware, verifyPassword);
};
