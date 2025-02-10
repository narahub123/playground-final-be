import { createUserDisplay } from "./display.service";

import { createUserNotifications } from "./notification.service";

import { createUserSecurity } from "./security.service";

import { createUserPrivacy } from "./privacy.service";

import { sendEmail } from "./email.service";

import verficationService from "./verification.service";

import DuplicateDetection from "./duplicate-detection.service";
import userService from "./user.service";
import loginFailureService from "./login-failure.service";
import authService from "./auth.service";
import activeSessionService from "./active-session.service";
import loginRecordService from "./login-record.service";

export {
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
  verficationService,

  // duplicate-detection
  DuplicateDetection,

  // user
  userService,

  // loginFailure
  loginFailureService,

  // auth
  authService,

  // active-session
  activeSessionService,

  // login-record
  loginRecordService,
};
