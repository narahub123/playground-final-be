import {
  checkEmailDuplication,
  checkPhoneDuplication,
  checkUserIdDuplication,
  getContactsBeforeLogin,
  getCurrentUser,
  addCountGroup,
  swtichAccount,
} from "@controllers";
import { authTokenMiddleware } from "@middlewares";
import { Router } from "express";

export default (router: Router) => {
  router.post("/users/check-duplication/email", checkEmailDuplication);
  router.post("/users/check-duplication/phone", checkPhoneDuplication);
  router.post("/users/check-duplication/userid", checkUserIdDuplication);
  router.post("/users/contacts", getContactsBeforeLogin);
  router.get("/users/me", authTokenMiddleware, getCurrentUser);
  router.post("/users/account-group", authTokenMiddleware, addCountGroup);
  router.post("/users/switch", authTokenMiddleware, swtichAccount);
};
