import { checkEmailAvailability } from "@controllers";
import { Router } from "express";

export default (router: Router) => {
  router.post("/users/check-duplication/email", checkEmailAvailability);
  router.post("/users/check-duplication/phone", checkEmailAvailability);
};
