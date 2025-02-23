import {
  checkEmailDuplication,
  checkPhoneDuplication,
  checkUserIdDuplication,
  getContactsBeforeLogin,
  getCurrentUser,
  addCountGroup,
  swtichAccount,
} from "./users.controller";

import {
  signupUser,
  loginUser,
  logoutAccount,
  logoutAllAccounts,
} from "./auth.controller";

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
  addCountGroup,
  swtichAccount,

  // auth
  loginUser,
  signupUser,
  logoutAccount,
  logoutAllAccounts,

  // oauth
  oauthCallback,

  // verification
  requestLoginVerificationCode,
  checkLoginVerificationCode,
};
