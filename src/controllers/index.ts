import {
  checkEmailDuplication,
  checkPhoneDuplication,
  checkUserIdDuplication,
  getContactsBeforeLogin,
} from "./users.controller";

import { signupUser, loginUser } from "./auth.controller";

import {
  requestLoginVerificationCode,
  checkLoginVerificationCode,
} from "./verification.controller";

import { oauthCallback } from "./oauth.controller";

export {
  // user
  checkEmailDuplication,
  checkPhoneDuplication,
  checkUserIdDuplication,
  getContactsBeforeLogin,

  // auth
  loginUser,
  signupUser,
  oauthCallback,

  // verification
  requestLoginVerificationCode,
  checkLoginVerificationCode,
};
