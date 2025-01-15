import { Router } from "express";
import {
  checkEmailDuplicateInSignup,
  checkUserIdDuplicateInSignup,
  registerUser,
} from "@controllers";

export default (router: Router) => {
  // 이메일 중복 검사
  router.post("/signup/checkEmailDuplicate", checkEmailDuplicateInSignup);
  // 사용자 아이디 중복 검사
  router.post("/signup/checkUserIdDuplicate", checkUserIdDuplicateInSignup);
  // 유저 정보 등록
  router.post("/signup/registerUser", registerUser);
};
