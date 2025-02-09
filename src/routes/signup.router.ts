import { Router } from "express";
import {
  checkEmailDuplicationInSignup,
  checkUserIdDuplicationInSignup,
  registerUser,
} from "@controllers";

export default (router: Router) => {
  // 이메일 중복 검사
  router.post("/signup/checkEmailDuplication", checkEmailDuplicationInSignup);
  // 사용자 아이디 중복 검사
  router.post("/signup/checkUserIdDuplication", checkUserIdDuplicationInSignup);
  // 유저 정보 등록
  router.post("/signup/registerUser", registerUser);
};
