import { Router } from "express";
import { requestLoginVerificationCode } from "@controllers";

export default (router: Router) => {
  router.post("/verification/request", requestLoginVerificationCode);
};
