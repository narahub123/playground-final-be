import { Router } from "express";
import {
  checkVerificationCodeLogin,
  getContactsByAccount,
  requestVerificationCodeLogin,
  verifyPasswordLogin,
} from "@controllers";

export default (router: Router) => {
  router.post("/login/verifyPassword", verifyPasswordLogin);
  router.post("/login/contact-info", getContactsByAccount);
  router.post("/login/request-verification-code", requestVerificationCodeLogin);
  router.post("/login/check-verification-code", checkVerificationCodeLogin);
};
