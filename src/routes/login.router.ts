import { Router } from "express";
import { getContactsByAccount, verifyPasswordLogin } from "@controllers";

export default (router: Router) => {
  router.post("/login/verifyPassword", verifyPasswordLogin);
  router.post("/login/contact-info", getContactsByAccount);
};
