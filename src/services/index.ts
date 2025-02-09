import {
  getUserByUserId,
  getUserByEmail,
  getUserByPhone,
  checkEmailDuplication,
  checkUserIdDuplication,
  createUser,
  updateLockStatus,
} from "./user.service";

import { createUserDisplay } from "./display.service";

import { createUserNotifications } from "./notifications.service";

import { createUserSecurity } from "./security.service";

import { createUserPrivacy } from "./privacy.service";

import { sendEmail } from "./email.service";

import {
  createVerification,
  fetchVerificationCodeByUserId,
  deleteVerificationCode,
} from "./verification.service";

import {
  createActiveSession,
  getActiveSessionByInfo,
} from "./active-session.service";

import {
  getLoginFailureByUserId,
  createLoginFailure,
  updateFailureTypeToBruteForce,
  deleteLoginFailuresById,
} from "./login-failure.service";

import { getLoginRecordsByUserId } from "./login-record.service";

export {
  getUserByUserId,
  getUserByEmail,
  getUserByPhone,
  checkEmailDuplication, // 이메일 중복 검사
  checkUserIdDuplication, // 사용자 아이디 중복 검사
  createUser, // 회원 가입
  updateLockStatus, // 계정 잠금 업데이트

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
  fetchVerificationCodeByUserId,
  deleteVerificationCode,

  // active-session
  createActiveSession,
  getActiveSessionByInfo,

  // login-attempt
  getLoginFailureByUserId,
  createLoginFailure,
  updateFailureTypeToBruteForce,
  deleteLoginFailuresById,

  // login-record
  getLoginRecordsByUserId,
};
