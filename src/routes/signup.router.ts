import { Router } from "express";
import {
  checkEmailDuplicateInSignup,
  checkUserIdDuplicateInSignup,
} from "@controllers";

export default (router: Router) => {
  // 이메일 중복 검사
  router.post("/signup/checkEmailDuplicate", checkEmailDuplicateInSignup);
  // 사용자 아이디 중복 검사
  router.post("/signup/checkUserIdDuplicate", checkUserIdDuplicateInSignup);
};
