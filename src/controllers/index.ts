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

export {
  getUserByUserId,
  getUserByEmail,
  getUserByPhone,
  checkEmailDuplicateInSignup,
  checkUserIdDuplicateInSignup,
  registerUser,
};
