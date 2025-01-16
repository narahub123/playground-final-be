import {
  fetchUserByUserId,
  fetchUserByEmail,
  fetchUserByPhone,
  checkEmailDuplicate,
  checkUserIdDuplicate,
  createUser,
} from "./user.service";

import { createUserDisplay } from "./display.service";

import { createUserNotifications } from "./notifications.service";

import { createUserSecurity } from "./security.service";

import { createUserPrivacy } from "./privacy.service";

import { sendEmail } from "./email.service";

import { createVerification } from "./verification.service";

export {
  fetchUserByUserId,
  fetchUserByEmail,
  fetchUserByPhone,
  checkEmailDuplicate, // 이메일 중복 검사
  checkUserIdDuplicate, // 사용자 아이디 중복 검사
  createUser, // 회원 가입

  // display
  createUserDisplay,

  // notifications
  createUserNotifications,

  // security
  createUserSecurity,

  // privacy
  createUserPrivacy,

  // email
  sendEmail,

  // verificationCode
  createVerification,
};
