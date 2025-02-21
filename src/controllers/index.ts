import {
  checkEmailDuplication,
  checkPhoneDuplication,
  checkUserIdDuplication,
  getContactsBeforeLogin,
  getCurrentUser,
} from "./users.controller";

import { signupUser, loginUser, logoutAccount } from "./auth.controller";

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
  getCurrentUser,

  // auth
  loginUser,
  signupUser,
  logoutAccount,

  // oauth
  oauthCallback,

  // verification
  requestLoginVerificationCode,
  checkLoginVerificationCode,
};
