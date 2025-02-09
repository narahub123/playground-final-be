import {
  checkEmailAvailability,
  checkPhoneAvailability,
  checkUserIdAvailability,
  getContactsBeforeLogin,
} from "./users.controller";

import { signupUser, loginUser } from "./auth.controller";

import { requestLoginVerificationCode } from "./verification.controller";
import {
  checkEmailDuplicationInSignup,
  checkUserIdDuplicationInSignup,
} from "./signup.controller";

import { oauthCallback } from "./oauth.controller";

import {
  loginWithAccount,
  getContactsByAccount,
  checkLoginVerificationCode,
} from "./login.controller";

export {
  // user
  checkEmailAvailability,
  checkPhoneAvailability,
  checkUserIdAvailability,
  checkEmailDuplicationInSignup,
  checkUserIdDuplicationInSignup,
  getContactsBeforeLogin,
  // auth
  loginUser,
  signupUser,
  oauthCallback,
  // login
  loginWithAccount,
  getContactsByAccount,

  // verification
  requestLoginVerificationCode,
  checkLoginVerificationCode,
};
