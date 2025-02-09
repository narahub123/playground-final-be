import { Router } from "express";
import {
  checkLoginVerificationCode,
  getContactsByAccount,
  requestLoginVerificationCode,
  loginWithAccount,
} from "@controllers";

export default (router: Router) => {
  router.post("/login/account", loginWithAccount);
  router.post("/login/contact-info", getContactsByAccount);
  router.post("/login/request-verification-code", requestLoginVerificationCode);
  router.post("/login/check-verification-code", checkLoginVerificationCode);
};
