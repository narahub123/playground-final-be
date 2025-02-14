import { sendEmail } from "./email.service";
import verificationService from "./verification.service";
import duplicateDetectionService from "./duplicate-detection.service";
import userService from "./user.service";
import loginFailureService from "./login-failure.service";
import authService from "./auth.service";
import activeSessionService from "./active-session.service";
import loginRecordService from "./login-record.service";

export {
  // email
  sendEmail,

  // verificationCode
  verificationService,

  // duplicate-detection
  duplicateDetectionService,

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
