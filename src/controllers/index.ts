import {
  getUserByUserId,
  getUserByEmail,
  getUserByPhone,
} from "./user.controller";

import { checkEmailDuplicateInSignup } from "./signup.controller";

export {
  getUserByUserId,
  getUserByEmail,
  getUserByPhone,
  checkEmailDuplicateInSignup,
};
