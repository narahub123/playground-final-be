import { Router } from "express";
import {
  checkEmailDuplicationInSignup,
  checkUserIdDuplicationInSignup,
  signupUser,
} from "@controllers";

export default (router: Router) => {
  // 이메일 중복 검사
  router.post("/signup/check-email-duplication", checkEmailDuplicationInSignup);
  // 사용자 아이디 중복 검사
  router.post(
    "/signup/check-userid-duplication",
    checkUserIdDuplicationInSignup
  );
  // 유저 정보 등록
  router.post("/signup/signupUser", signupUser);
};
