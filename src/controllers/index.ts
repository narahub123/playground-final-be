import {} from "./users.controller";

import {
  checkEmailDuplicationInSignup,
  checkUserIdDuplicationInSignup,
  registerUser,
} from "./signup.controller";

import { oauthCallback } from "./oauth.controller";

import {
  loginWithAccount,
  getContactsByAccount,
  requestLoginVerificationCode,
  checkLoginVerificationCode,
} from "./login.controller";

export {
  checkEmailDuplicationInSignup,
  checkUserIdDuplicationInSignup,
  registerUser,
  oauthCallback,
  // login
  loginWithAccount,
  getContactsByAccount,
  requestLoginVerificationCode,
  checkLoginVerificationCode,
};
