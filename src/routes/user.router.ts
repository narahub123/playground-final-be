import { getUserByUserId } from "@controllers";
import { Router } from "express";

export default (router: Router) => {
  router.get("getUserByUserId", getUserByUserId); // userId로 유저 정보 얻기
};
