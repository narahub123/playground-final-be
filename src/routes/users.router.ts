import {
  checkEmailDuplication,
  checkPhoneDuplication,
  checkUserIdDuplication,
  getContactsBeforeLogin,
} from "@controllers";
import { Router } from "express";

export default (router: Router) => {
  router.post("/users/check-duplication/email", checkEmailDuplication);
  router.post("/users/check-duplication/phone", checkPhoneDuplication);
  router.post("/users/check-duplication/userid", checkUserIdDuplication);
  router.post("/users/contacts", getContactsBeforeLogin);
};
