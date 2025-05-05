import { Request, Response } from "express";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "@errors";
import { asyncWrapper } from "@middlewares";
import {
  activeSessionService,
  displayService,
  duplicateDetectionService,
  loginRecordService,
  notificationService,
  postService,
  privacyService,
  securityService,
  userPostActionService,
  userService,
} from "@services";
import {
  IApiSuccessResponse,
  IDevice,
  IEmoji,
  IFollowingResponse,
  ILocation,
  IUser,
  UserDTO,
} from "@types";
import {
  comparePassword,
  createHashedPassword,
  setRefreshTokenCookie,
} from "@utils";
import { RECENT_EMOJIS_MAX } from "@constants";
import mongoose from "mongoose";
import { Types } from "mongoose";

const checkEmailDuplication = asyncWrapper(
  "checkEmailDuplication",
  "Email duplicate check failed. (이메일 중복 체크 실패)",
  "EMAIL_DUPLICATE_CHECK_FAILED", // 이메일 중복 체크 실패
  async (req: Request, res: Response) => {
    // 요청 본문에서 이메일을 추출합니다.
    const { email } = req.body;

    // 이메일이 제공되지 않았을 경우 BadRequestError를 던집니다.
    if (!email) {
      throw new BadRequestError(
        "Email is required. (이메일 필수)",
        "VALIDATION_ERROR",
        {
          email: "MISS_EMAIL",
        }
      );
    }

    // 이메일 중복 체크
    const isDuplicate = await duplicateDetectionService.isEmailDuplicate(email);

    const response: IApiSuccessResponse<{ isDuplicate: boolean }> = {
      success: true,
      message: "Email duplicate check succeeded. (이메일 중복 체크 성공)",
      code: "EMAIL_DUPLICATE_CHECK_SUCCEEDED",
      timestamp: new Date().toISOString(),
      data: { isDuplicate },
    };

    // 중복 여부를 클라이언트에 JSON 형식으로 반환합니다.
    res.status(200).json(response);
  }
);

const checkPhoneDuplication = asyncWrapper(
  "checkPhoneDuplication",
  "Phone duplicate check failed. (휴대 전화 번호 중복 체크 실패)",
  "PHONE_DUPLICATE_CHECK_FAILED", // 휴대 전화 번호 중복 체크 실패
  async (req: Request, res: Response) => {
    // 요청 본문에서 휴대 전화 번호를 추출합니다.
    const { phone } = req.body;

    // 휴대 전화 번호가 제공되지 않았을 경우 BadRequestError를 던집니다.
    if (!phone) {
      throw new BadRequestError(
        "Phone is required. (휴대 전화 번호 필수)",
        "VALIDATION_ERROR", // 에러 코드
        {
          phone: "MISSING_PHONE",
        }
      );
    }

    // 휴대 전화 번호 중복 체크
    const isDuplicate = await duplicateDetectionService.isPhoneDuplication(
      phone
    );

    const response: IApiSuccessResponse<{ isDuplicate: boolean }> = {
      success: true,
      message:
        "Phone duplicate check succeeded. (휴대 전화 번호 중복 체크 성공)",
      code: "PHONE_DUPLICATE_CHECK_SUCCEEDED",
      timestamp: new Date().toISOString(),
      data: { isDuplicate },
    };

    // 중복 여부를 클라이언트에 JSON 형식으로 반환합니다.
    res.status(200).json(response);
  }
);

const checkUserIdDuplication = asyncWrapper(
  "checkUserIdDuplication", // 함수의 이름
  "UserId duplicate check failed. (사용자 아이디 중복 체크 실패)", // 에러 메시지
  "USERID_DUPLICATE_CHECK_FAILED", // 사용자 아이디 중복 체크 실패
  async (req: Request, res: Response) => {
    // 요청 본문에서 사용자 아이디를 추출합니다.
    const { userId } = req.body;

    // 사용자 아이디가 제공되지 않았을 경우 BadRequestError를 던집니다.
    if (!userId) {
      throw new BadRequestError(
        "UserId is required. (사용자 아이디 필수)", // 에러 메시지
        "VALIDATION_ERROR", // 에러 코드
        {
          userId: "MISSING_USERID",
        }
      );
    }

    // 사용자 아이디 중복 체크
    const isDuplicate = await duplicateDetectionService.isUserIdDuplicate(
      userId
    );

    // 성공적인 응답 생성
    const response: IApiSuccessResponse<{ isDuplicate: boolean }> = {
      success: true,
      message:
        "UserId duplicate check succeeded. (사용자 아이디 중복 체크 성공)", // 성공 메시지
      code: "USERID_DUPLICATE_CHECK_SUCCEEDED", // 응답 코드
      timestamp: new Date().toISOString(), // 응답 시각
      data: { isDuplicate }, // 중복 여부
    };

    // 중복 여부를 클라이언트에 JSON 형식으로 반환합니다.
    res.status(200).json(response);
  }
);

// 계정 정보로 연락처를 조회하는 API 핸들러
const getContactsBeforeLogin = asyncWrapper(
  "getContactsByAccount",
  "Failed to fetch contacts. (연락처 조회 실패)",
  "GET_CONTACTS_FAILED", // 연락처 조회 실패
  async (req: Request, res: Response) => {
    // 요청 본문에서 사용자 ID, 이메일, 전화번호 추출
    const { userId, email, phone } = req.body;

    // 이메일, 휴대 전화 번호, 사용자 아이디 중 하나라도 없으면 BadRequestError 발생
    if (!userId && !email && !phone) {
      throw new BadRequestError(
        "At least one of email, phone, and userId is required. (이메일, 휴대전화번호, 사용자 아이디 중 최소 하나는 필수)", // 에러 메시지
        "VALIDATION_ERROR", // 에러 코드
        {
          email: "MISSING_EMAIL", // 에러 세부사항
          phone: "MISSING_PHONE", // 에러 세부사항
          userId: "MISSING_USERID", // 에러 세부사항
        }
      );
    }

    const user = await userService.findUserByIdentifier(email, phone, userId);

    const { emails, phones } = await userService.getContactsByIdentifier(
      user.userId
    );

    // 성공적인 응답 생성
    const response: IApiSuccessResponse<{
      emails: string[];
      phones: string[];
    }> = {
      success: true,
      message: "Contacts fetched successfully. (연락처 조회 성공)", // 성공 메시지
      code: "GET_CONTACTS_SUCCEEDED", // 응답 코드
      timestamp: new Date().toISOString(), // 응답 시각
      data: {
        emails: emails.map((item) => item.email),
        phones: phones.map((item) => item.phone),
      }, // 중복 여부
    };

    res.status(200).json(response);
  }
);

const getCurrentUser = asyncWrapper(
  "getCurrentUser",
  "User not found. (사용자를 찾을 수 없음)",
  "USER_NOT_FOUND",
  async (req: Request, res: Response) => {
    const user = req.user;

    const userData = user.toObject();

    let newAccountGroup = [];

    for (const userId of user.accountGroup) {
      const account = await userService.getUserById(userId);

      if (!account) {
        throw new NotFoundError(
          "User not Found. (사용자 조회 실패)",
          "NOT_FOUND",
          {
            userId: "USER_NOT_FOUND",
          }
        );
      }

      const { username, profileImage, intro } = account;

      newAccountGroup.push({
        userId,
        username,
        profileImage,
        intro,
      });
    }

    const { emails, phones } = await userService.getContactsByIdentifier(
      user.userId
    );

    const likes = await userPostActionService.getLikesByUserId(user._id);
    const bookmarks = await userPostActionService.getBookmarksByUserId(
      user._id
    );

    const userInfo = {
      ...userData,
      accountGroup: newAccountGroup,
      emails: emails.map((item) => item.email),
      phones: phones.map((item) => item.phone),
      likes,
      bookmarks,
    };

    const display = await displayService.getDisplayByUserId(user._id);

    const security = await securityService.getSecurityByUserId(user._id);

    const privacy = await privacyService.getPrivacyByUserId(user._id);

    const notification = await notificationService.getNotificationByUserId(
      user._id
    );

    const activeSessions = await activeSessionService.getActiveSessionsByUserId(
      user._id
    );

    const loginRecords = await loginRecordService.getLoginRecordsByUserId(
      user._id
    );

    const securityInfo = {
      ...JSON.parse(JSON.stringify(security)),
      activeSessions,
      loginRecords,
    };

    const posts = await postService.getPostsByAuthor(user._id);

    const response = {
      success: true,
      message:
        "Current user info retrieved successfully. (현재 사용자 정보 조회 성공)",
      code: "GET_CURRENT_USER_SUCCEEDED",
      timestamp: new Date().toISOString(),
      data: {
        user: userInfo,
        security: securityInfo,
        privacy,
        notification,
        display,
        posts,
      },
    };

    res.status(200).json(response);
  }
);

const addCountGroup = asyncWrapper(
  "addCountGroup",
  "Adding an account failed. (계정 추가 실패)",
  "ADD_ACCOUNT_FAILED",
  async (req: Request, res: Response) => {
    const user = req.user;
    const { userId, email, phone, password } = req.body;

    // 비밀번호가 제공되지 않은 경우 BadRequestError 발생
    if (!password) {
      throw new BadRequestError(
        "Password is required. (비밀번호 필수)",
        "MISSING_PASSWORD",
        { password: "비밀번호가 제공되지 않았습니다." }
      );
    }

    // 이메일, 전화번호, 사용자 ID 중 하나도 제공되지 않은 경우 BadRequestError 발생
    if (!email && !phone && !userId) {
      throw new BadRequestError(
        "At least one of email, phone, or userId is required. (이메일, 휴대전화 번호, 사용자 아이디 중 적어도 하나 필수)",
        "VALIDATION_ERROR",
        {
          email: "MISSING_EMAIL", // 에러 세부사항
          phone: "MISSING_PHONE", // 에러 세부사항
          userId: "MISSING_USERID", // 에러 세부사항
        }
      );
    }

    // 추가하려는 계정이 이미 존재하는 계정인지 여부 확인
    const accountGroup = user.accountGroup;
    if (accountGroup.includes(userId)) {
      throw new ConflictError(
        "The account already exists in the group. (이미 계정이 그룹에 존재합니다.)",
        "DUPLICATE_ERROR",
        {
          account: "ACCOUNT_ALREADY_EXISTS",
        }
      );
    }

    // 계정 존재 여부 확인
    const account = await userService.findUserByIdentifier(
      email,
      phone,
      userId
    );

    // 비밀번호 검증
    const isValid = await comparePassword(password, account.password);

    if (!isValid) {
      // 비밀번호가 일치하지 않으면 UnauthorizedError 예외를 던짐
      throw new UnauthorizedError(
        "Incorrect password. (비밀번호 불일치)",
        "AUTHENTICATION_FAILED",
        {
          password: "PASSWORD_UNMATCHED",
        }
      );
    }

    // 계정 추가
    // 현재 계정
    await userService.addAccountGroup(user.userId, account.userId);
    // 추가된 계정
    await userService.addAccountGroup(account.userId, user.userId);

    const newAccount = {
      userId: account.userId,
      username: account.username,
      profileImage: account.profileImage,
      intro: account.intro,
    };

    const response: IApiSuccessResponse<{ newAccount: any }> = {
      success: true,
      message: "A new account is added successfully. (계정 추가 성공)",
      code: "ADD_ACCOUNT_SUCCEEDED",
      timestamp: new Date().toISOString(),
      data: {
        newAccount,
      },
    };

    res.status(200).json(response);
  }
);

const swtichAccount = asyncWrapper(
  "swtichAccount",
  "Account switch failed. (계정 전환 실패)",
  "ACCOUNT_SWITCH_FAILED",
  async (req: Request, res: Response) => {
    const { targetUserId } = req.body;
    const user = req.user;
    const currentSessionId = req.activeSessionId;

    // 유효성 검사
    if (!targetUserId) {
      throw new BadRequestError(
        "Target userId is required. (변경할 계정 사용자 아이디 필수)",
        "VALIDATION_ERROR",
        { userId: "MISSING_TARGET_USERID" }
      );
    }

    // 이미 로그인한 사용자와 동일한 targetUserId인지 확인
    if (user.userId === targetUserId) {
      throw new ConflictError(
        "Target userId is the same as current userId. (계정 전환 계정과 현재 계정과 일치)",
        "ACCOUNT_CONFLICT",
        {
          targetUserId: "USER_ALREADY_LOGGED_IN",
        }
      );
    }

    // 전환 가능 계정인지 확인
    if (!user.accountGroup.includes(targetUserId)) {
      throw new UnauthorizedError(
        "Account switch to the target user is not authorized. (계정 전환 불허용)",
        "ACCOUNT_NOT_AUTHORIZED",
        { targetUserId: "USER_NOT_IN_ACCOUNT_GROUP" }
      );
    }

    // 계정 유효성 검사
    const target = await userService.getUserByUserId(targetUserId);

    if (!target) {
      throw new NotFoundError(
        "Target account is not Found (변경할 계정 조회 실패)",
        "ACCOUNT_NOT_FOUND",
        {
          targetUserId: "USER_ACCOUNT_NOT_FOUND",
        }
      );
    }

    // 변경할 계정이 비활성 계정인지 여부 확인하기
    if (user.lockStatus.isLocked) {
      throw new BadRequestError(
        "The account is inactive and cannot be used for account switching. (비활성화된 계정으로는 계정 전환이 불가능합니다.)",
        "ACCOUNT_INACTIVE",
        { status: "INACTIVE_ACCOUNT" }
      );
    }

    // activeSessionId를 통해서 현재 세션의 device, ip, location 정보 가져오기
    const activeSession = await activeSessionService.getActiveSessionsById(
      currentSessionId
    );

    if (!activeSession) {
      throw new NotFoundError(
        "No active session found for the current account. (현재 계정의 활성 세션 조회 실패)",
        "NOT_FOUND",
        {
          currentSessionId: "ACTIVE_SESSION_NOT_FOUND",
        }
      );
    }

    const { device, ip, location } = activeSession;

    const newActiveSession = {
      userId: targetUserId,
      device: device as IDevice,
      ip: ip as string,
      location: location as ILocation,
    };

    // 기존 세션 확인하기
    const existingActiveSessionId =
      await activeSessionService.findActiveSessionIdBySessionInfo(
        newActiveSession
      );

    // 새로운 세션 생성 및 토큰 발급
    const { refreshToken, accessToken, activeSessionId } =
      await activeSessionService.createSessionAndIssueTokens({
        userId: targetUserId,
        device: device as IDevice,
        ip: ip as string,
        location: location as ILocation,
        userRole: target.userRole,
      });

    // 기존 세션이 있으면 바로 로그인 성공 응답 반환
    if (existingActiveSessionId) {
      // refresh token을 쿠키에 저장 (보안 설정 포함)
      setRefreshTokenCookie(res, refreshToken);

      return res.status(200).json({
        success: true,
        message: "Account switch successful. (계정 전환 성공)",
        code: "ACCOUNT_SWITCH_SUCCEEDED",
        timestamp: new Date().toISOString(),
        data: {
          accessToken,
          activeSessionId: existingActiveSessionId,
        },
      });
    } else {
      // 기존 세션이 없는 경우
      // 로그인 기록을 저장
      await loginRecordService.createLoginRecord({
        userId: targetUserId,
        activeSessionId,
        device: device as IDevice,
        ip: ip as string,
        location: location as ILocation,
      });

      // refresh token을 쿠키에 저장 (보안 설정 포함)
      setRefreshTokenCookie(res, refreshToken);

      // 계정 전환 성공 응답
      res.status(201).json({
        success: true,
        message: "Account switch successful. (계정 전환 성공)",
        code: "ACCOUNT_SWITCH_SUCCEEDED",
        timestamp: new Date().toISOString(),
        data: {
          accessToken,
          activeSessionId,
        },
      });
    }
  }
);

const changePassword = asyncWrapper(
  "changePassword",
  "Password change failed. (비밀번호 변경 실패)",
  "PASSWORD_CHANGE_FAILED",
  async (req: Request, res: Response) => {
    const user = req.user;
    const { password, newPassword } = req.body;

    // 유효성 검사
    if (!password) {
      throw new BadRequestError(
        `Password is not Found. (비밀번호 필수)`,
        "VALIDATION_ERROR",
        {
          password: `PASSWORD_MISSING`,
        }
      );
    }

    if (!newPassword) {
      throw new BadRequestError(
        `New password is not Found. (새 비밀번호 필수)`,
        "VALIDATION_ERROR",
        {
          newPassword: `NEW_PASSWORD_MISSING`,
        }
      );
    }

    // 비밀번호 인증
    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      throw new UnauthorizedError(
        "Incorrect password. (비밀번호 불일치)",
        "AUTHENTICATION_FAILED",
        {
          password: "PASSWORD_UNMATCHED",
        }
      );
    }

    // 기존 비밀번호와 동일한지 확인
    const isSamePassword = await comparePassword(newPassword, user.password);

    if (isSamePassword) {
      throw new BadRequestError(
        "New password must be different from the current password. (기존 비밀번호와 동일)",
        "SAME_PASSWORD",
        { newPassword: "PASSWORD_UNCHANGED" }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await createHashedPassword(newPassword);

    await userService.changePassword(user.userId, hashedPassword);

    const response: IApiSuccessResponse = {
      success: true,
      message: "Password has changed successfully. (비밀번호 변경 성공)",
      code: "PASSWORD_CHANGE_SUCCEEDED",
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  }
);

const updateMe = asyncWrapper(
  "updateMe",
  "Updating user failed. (유저 정보 업데이트 실패)",
  "USER_UPDATE_FAILED",
  async (req: Request, res: Response) => {
    const user = req.user;
    const body: UserDTO = req.body;

    if (body.skintoneType) {
      await userService.updateSkintoneType(user.userId, body.skintoneType);
    }

    if (body.recentEmoji) {
      const prevRecentEmojis: IEmoji[] = user.recentEmojis;

      // 이미 있는 이모지 제거
      const filtered = prevRecentEmojis.filter(
        (emoji) => emoji.char !== body.recentEmoji.char
      );

      // 새로운 이모지를 최근 이모지 앞에 추가
      const newRecentEmojis: IEmoji[] = [body.recentEmoji, ...filtered];

      // 최근 이모지의 개수 제한
      const limitedRecentEmojis: IEmoji[] = newRecentEmojis.slice(
        0,
        RECENT_EMOJIS_MAX
      );

      await userService.updateRecentEmojis(user.userId, limitedRecentEmojis);
    }

    if (body.pinnedPost) {
      const pinnedPostId = new mongoose.Types.ObjectId(body.pinnedPost);

      await userService.updatePinnedPost(user._id, pinnedPostId);
    }

    type ResponseData =
      | { following: IFollowingResponse }
      | { unfollowing: Types.ObjectId }
      | null;

    const response: IApiSuccessResponse<ResponseData> = {
      success: true,
      message: "User has been updated successfully. (유저 정보 업데이트 성공)",
      code: "USER_UPDATE_SUCCEEDED",
      timestamp: new Date().toISOString(),
    };

    if (body.following) {
      const following = new mongoose.Types.ObjectId(body.following);

      const followingResult = await userService.updateFollowingAndFollower(
        user._id,
        following
      );

      if (typeof followingResult === "object" && "userId" in followingResult) {
        // IFollowingResponse
        response.data = { following: followingResult };
      } else {
        // ObjectId (언팔로우)
        response.data = { unfollowing: followingResult };
      }
    }

    res.status(200).json(response);
  }
);

const clearRecentEmojis = asyncWrapper(
  "clearRecentEmojis",
  "Clearing recentEmojis failed(최근 이모지 비우기 실패)",
  "CLEAR_RECENT_EMOJIS_FAILED",
  async (req: Request, res: Response) => {
    const { userId } = req.user;

    await userService.updateRecentEmojis(userId, []);

    const response: IApiSuccessResponse = {
      success: true,
      message: "RecentEmojis are clear successfully. (최근 이모지 비우기 성공)",
      code: "CLEAR_RECENT_EMOJIS_SUCCEEDED",
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  }
);

const getUserInfo = asyncWrapper(
  "getUserInfo",
  "Getting user info failed(사용자 정보 가져오기 실패)",
  "GET_USER_INFO_FAILED",
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
      throw new BadRequestError("");
    }

    const user = await userService.getUserByUserId(userId);

    const response: IApiSuccessResponse<{ user: IUser | null }> = {
      success: true,
      message: "Getting user info is successful.(사용자 정보 가져오기 성공)",
      code: "GET_USER_INFO_SUCCEEDED",
      data: { user },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  }
);

export {
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
};
