import {
  checkEmailDuplication,
  checkPhoneDuplication,
  checkUserIdDuplication,
  getContactsBeforeLogin,
  getCurrentUser,
  addCountGroup,
  swtichAccount,
  changePassword,
  updateMe,
  clearRecentEmojis,
  getUserInfo,
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

import {
  creatNewPost,
  getPostPreview,
  updatePostVote,
  addRepost,
  updateLikes,
  deletePost,
  updatePin,
  getPostById,
  updateBookmarks,
  createComment,
  getComments,
  createQuote,
  getPostsByUserAndFollowings,
} from "./post.controller";

import privacyController from "./privacy.controller";

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
  updateMe,
  clearRecentEmojis,
  getUserInfo,

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

  // post
  creatNewPost,
  getPostPreview,
  updatePostVote,
  addRepost,
  updateLikes,
  deletePost,
  updatePin,
  getPostById,
  updateBookmarks,
  createComment,
  getComments,
  createQuote,
  getPostsByUserAndFollowings,

  // privacy
  privacyController,
};
