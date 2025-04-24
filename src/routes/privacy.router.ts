import { Router } from "express";
import { authTokenMiddleware } from "@middlewares";
import { privacyController } from "@controllers";

export default (router: Router) => {
  router.patch(
    "/privacies/me",
    authTokenMiddleware,
    privacyController.updateMyPrivacy
  );
};
