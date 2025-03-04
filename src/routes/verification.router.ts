import { Router } from "express";
import {
  checkLoginVerificationCode,
  requestLoginVerificationCode,
  requestVerificationCode,
} from "@controllers";
import { authTokenMiddleware } from "@middlewares";

export default (router: Router) => {
  router.post("/verification/request", requestLoginVerificationCode);
  router.post(
    "/verification/me/request",
    authTokenMiddleware,
    requestVerificationCode
  );
  router.post("/verification/verify", checkLoginVerificationCode);
};
