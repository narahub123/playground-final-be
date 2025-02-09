import { signupUser } from "@controllers";
import { Router } from "express";

export default (router: Router) => {
  router.post("/auth/signup", signupUser);
};
