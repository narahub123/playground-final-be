import {
  checkEmailAvailability,
  checkPhoneAvailability,
  checkUserIdAvailability,
} from "./users.controller";

import {
  checkEmailDuplicationInSignup,
  checkUserIdDuplicationInSignup,
  signupUser,
} from "./signup.controller";

import { oauthCallback } from "./oauth.controller";

import {
  loginWithAccount,
  getContactsByAccount,
  requestLoginVerificationCode,
  checkLoginVerificationCode,
} from "./login.controller";

export {
  // user
  checkEmailAvailability,
  checkPhoneAvailability,
  checkUserIdAvailability,
  checkEmailDuplicationInSignup,
  checkUserIdDuplicationInSignup,
  signupUser,
  oauthCallback,
  // login
  loginWithAccount,
  getContactsByAccount,
  requestLoginVerificationCode,
  checkLoginVerificationCode,
};
