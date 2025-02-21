import { loginUser, logoutAccount, signupUser } from "@controllers";
import { authTokenMiddleware } from "@middlewares";
import { Router } from "express";

export default (router: Router) => {
  router.post("/auth/signup", signupUser);
  router.post("/auth/login", loginUser);
  router.post("/auth/logout", authTokenMiddleware, logoutAccount);
};
