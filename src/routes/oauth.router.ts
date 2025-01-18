import { oauthCallback } from "@controllers";
import { Router } from "express";

export default (router: Router) => {
  router.get("/oauth/callback", oauthCallback);
};
