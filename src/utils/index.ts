import connectDB from "./connectDB";
import createHashedPassword from "./createHashedPassword";
import uploadImages from "./uploadImages";
import generateAuthCode from "./generateAuthCode";
import deleteImages from "./deleteImages";
import getOauthAccessToken from "./getOauthAccessToken";
import getOauthUserInfo from "./getOauthUserInfo";
import comparePassword from "./comparePassword";
import createRefreshToken from "./createRefreshToken";
import createAccessToken from "./createAccessToken";
import mongoDBErrorHandler from "./mongoDBErrorHandler";
import extractCountryFromLanguage from "./extractCountryFromLanguage";
import verifyAccountLock from "./verifyAccountLock";
import clearRefreshTokenCookie from "./clearRefreshTokenCookie";
import { handleLogout, handleTokenExpirationLogout } from "./handleLogout";
import setRefreshTokenCookie from "./setRefreshTokenCookie";
import uploadVideo from "./uploadVideo";
import uploadImage from "./uploadImage";
import uploadMedia from "./uploadMedia";
import modifyVote from "./modifyVote";
import deleteImage from "./deleteImage";
import deleteVideo from "./deleteVideo";
import deleteMedia from "./deleteMedia";
import mapPostToIPostResponseDto from "./mapPostToIPostResponseDto";
import {
  matchPostById,
  matchPostsByUserId,
  graphLookupOriginalPosts,
  addSortedOriginalPosts,
  unwindOriginalPosts,
  lookupOriginalPostAuthor,
  mapAuthorInfoToOriginalPosts,
  groupOriginalPosts,
  addPostData,
  fetchCommentsFromActions,
  lookupCommentAuthors,
  mergeCommentAuthors,
  projectFinalFields,
  addSortKey,
  sortBySortKeyDesc,
  addThreadLastCommentedAt,
  fetchCommentsFromActionsWithSkip,
  unwindComments,
  replaceRootWithComments,
  addSession,
  lookupCommentsByPostId,
  matchPostsByUserAndFollowings,
  matchReposts,
  replaceRootWithFirstRepost,
  addIsRepostedByCurrentUser,
  addRepostedOriginalPostIds,
  lookupRepostsByCurrentUser,
  skipPosts,
  limitResults,
} from "./aggregatePipelines";

import aggregatePostById from "./aggregatePostById";
import aggregatePostsByUserId from "./aggregatePostsByUserId";
import aggregateCommentsByPostId from "./aggregateCommentsByPostId";
import aggregatePostsByUserAndFollowings from "./aggregatePostsByUserAndFollowings";

import {
  Aggregate,
  MatchStage,
  LookupStage,
  FacetStage,
  SortStage,
  ProjectStage,
  GroupStage,
  LimitStage,
  UnwindStage,
  AddFieldsStage,
  ReplaceRootStage,
  SkipStage,
  SetStage,
  Extra,
} from "./aggregations";

import { extractQuery, splitToken, parseSearchKeyword } from "./search";

export {
  Aggregate,
  MatchStage,
  LookupStage,
  FacetStage,
  SortStage,
  ProjectStage,
  GroupStage,
  LimitStage,
  UnwindStage,
  AddFieldsStage,
  ReplaceRootStage,
  SkipStage,
  SetStage,
  Extra,
};

export {
  connectDB,
  createHashedPassword,
  uploadImages,
  generateAuthCode,
  deleteImages,
  getOauthAccessToken,
  getOauthUserInfo,
  comparePassword,
  createRefreshToken,
  createAccessToken,
  extractCountryFromLanguage,
  mongoDBErrorHandler,
  verifyAccountLock,
  clearRefreshTokenCookie,
  handleLogout,
  handleTokenExpirationLogout,
  setRefreshTokenCookie,
  uploadVideo,
  uploadImage,
  uploadMedia,
  modifyVote,
  deleteImage,
  deleteVideo,
  deleteMedia,
  mapPostToIPostResponseDto,
  aggregatePostById,
  aggregatePostsByUserId,
  aggregateCommentsByPostId,
  aggregatePostsByUserAndFollowings,
  extractQuery,
  splitToken,
  parseSearchKeyword,

  // aggregatePipelines
  matchPostById,
  matchPostsByUserId,
  graphLookupOriginalPosts,
  addSortedOriginalPosts,
  unwindOriginalPosts,
  lookupOriginalPostAuthor,
  mapAuthorInfoToOriginalPosts,
  groupOriginalPosts,
  addPostData,
  fetchCommentsFromActions,
  lookupCommentAuthors,
  mergeCommentAuthors,
  projectFinalFields,
  addSortKey,
  sortBySortKeyDesc,
  addThreadLastCommentedAt,
  fetchCommentsFromActionsWithSkip,
  unwindComments,
  replaceRootWithComments,
  addSession,
  lookupCommentsByPostId,
  matchPostsByUserAndFollowings,
  matchReposts,
  replaceRootWithFirstRepost,
  addIsRepostedByCurrentUser,
  addRepostedOriginalPostIds,
  lookupRepostsByCurrentUser,
  skipPosts,
  limitResults,
};
