import { getUserByEmail, getUserByPhone, getUserByUserId } from "@controllers";
import { Router } from "express";

export default (router: Router) => {
  router.get("getUserByUserId", getUserByUserId); // userId로 유저 정보 얻기
  router.get("getUserByEmail", getUserByEmail); // 이메일로 유저 정보 얻기
  router.get("getUserByPhone", getUserByPhone); // 전화번호로 유저 정보 얻기
};
