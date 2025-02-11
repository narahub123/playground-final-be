import {
  checkEmailDuplication,
  checkPhoneAvailability,
  checkUserIdAvailability,
  getContactsBeforeLogin,
} from "@controllers";
import { Router } from "express";

export default (router: Router) => {
  router.post("/users/check-duplication/email", checkEmailDuplication);
  router.post("/users/check-duplication/phone", checkPhoneAvailability);
  router.post("/users/check-duplication/userid", checkUserIdAvailability);
  router.post("/users/contacts", getContactsBeforeLogin);
};
