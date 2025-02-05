import { Router } from "express";
import { verifyPasswordLogin } from "@controllers";

export default (router: Router) => {
  router.post("/login/verifyPassword", verifyPasswordLogin);
};
