import { Router } from "express";
import { checkEmailDuplicateInSignup } from "@controllers";

export default (router: Router) => {
  // 이메일 중복 검사
  router.post("/signup/checkEmailDuplicate", checkEmailDuplicateInSignup);
};
