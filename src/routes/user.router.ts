import { getUserByEmail, getUserByPhone, getUserByUserId } from "@controllers";
import { Router } from "express";

export default (router: Router) => {
  router.get("/user/getUserByUserId:userId", getUserByUserId); // userId로 유저 정보 얻기
  router.get("/user/getUserByEmail:email", getUserByEmail); // 이메일로 유저 정보 얻기
  router.get("/user/getUserByPhone:phone", getUserByPhone); // 전화번호로 유저 정보 얻기
};
