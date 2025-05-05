import { sendEmail } from "./email.service";
import verificationService from "./verification.service";
import duplicateDetectionService from "./duplicate-detection.service";
import userService from "./user.service";
import loginFailureService from "./login-failure.service";
import authService from "./auth.service";
import activeSessionService from "./active-session.service";
import loginRecordService from "./login-record.service";
import displayService from "./display.service";
import notificationService from "./notification.service";
import privacyService from "./privacy.service";
import securityService from "./security.service";
import postService from "./post.service";
import userPostActionService from "./user-post-action.service";

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

  // display
  displayService,

  // notification
  notificationService,

  // privacy
  privacyService,

  // security
  securityService,

  // post
  postService,

  // userpostaction
  userPostActionService,
};
