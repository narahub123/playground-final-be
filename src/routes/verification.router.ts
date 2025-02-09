import { Router } from "express";
import {
  checkLoginVerificationCode,
  requestLoginVerificationCode,
} from "@controllers";

export default (router: Router) => {
  router.post("/verification/request", requestLoginVerificationCode);
  router.post("/verification/verify", checkLoginVerificationCode);
};
