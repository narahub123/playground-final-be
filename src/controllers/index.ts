import {
  checkEmailDuplication,
  checkPhoneDuplication,
  checkUserIdDuplication,
  getContactsBeforeLogin,
  getCurrentUser,
  addCountGroup,
  swtichAccount,
  changePassword,
} from "./users.controller";

import {
  signupUser,
  loginUser,
  logoutAccount,
  logoutAllAccounts,
  verifyPassword,
} from "./auth.controller";

import {
  requestLoginVerificationCode,
  checkLoginVerificationCode,
  requestVerificationCode,
  checkVerificationCode,
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
  changePassword,

  // auth
  loginUser,
  signupUser,
  logoutAccount,
  logoutAllAccounts,
  verifyPassword,

  // oauth
  oauthCallback,

  // verification
  requestLoginVerificationCode,
  checkLoginVerificationCode,
  requestVerificationCode,
  checkVerificationCode,
};
