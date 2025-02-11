import {
  checkEmailDuplication,
  checkPhoneAvailability,
  checkUserIdAvailability,
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
  checkPhoneAvailability,
  checkUserIdAvailability,
  getContactsBeforeLogin,

  // auth
  loginUser,
  signupUser,
  oauthCallback,

  // verification
  requestLoginVerificationCode,
  checkLoginVerificationCode,
};
