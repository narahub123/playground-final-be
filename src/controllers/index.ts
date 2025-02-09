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
  requestVerificationCodeLogin,
  checkVerificationCodeLogin,
} from "./login.controller";

export {
  checkEmailDuplicationInSignup,
  checkUserIdDuplicationInSignup,
  registerUser,
  oauthCallback,
  // login
  loginWithAccount,
  getContactsByAccount,
  requestVerificationCodeLogin,
  checkVerificationCodeLogin,
};
