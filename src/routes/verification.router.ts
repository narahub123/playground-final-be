import { Router } from "express";
import {
  checkLoginVerificationCode,
  requestLoginVerificationCode,
  requestVerificationCode,
  checkVerificationCode,
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
  router.post(
    "/verification/me/verify",
    authTokenMiddleware,
    checkVerificationCode
  );
};
