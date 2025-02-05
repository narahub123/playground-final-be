import {
  getUserByUserId,
  getUserByEmail,
  getUserByPhone,
} from "./user.controller";

import {
  checkEmailDuplicateInSignup,
  checkUserIdDuplicateInSignup,
  registerUser,
} from "./signup.controller";

import { oauthCallback } from "./oauth.controller";

import { verifyPasswordLogin } from "./login.controller";

export {
  getUserByUserId,
  getUserByEmail,
  getUserByPhone,
  checkEmailDuplicateInSignup,
  checkUserIdDuplicateInSignup,
  registerUser,
  oauthCallback,
  verifyPasswordLogin,
};
