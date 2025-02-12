import { Request, Response } from "express";
import { BadRequestError, CustomAPIError, InternalServerError } from "@errors";
import { asyncWrapper } from "@middlewares";
import {
  verifyAccountLock,
  combineBirth,
  createHashedPassword,
  deleteImages,
  extractCountryFromLanguage,
  uploadImages,
} from "@utils";
import {
  activeSessionService,
  authService,
  loginFailureService,
  userService,
} from "@services";
import { UploadApiResponse } from "cloudinary";
import mongoose from "mongoose";
import { REFRESHTOKEN_EXPIRES } from "@constants";
import { IApiSuccessResponse, INotificationInput, IUserInput } from "@types";
import verificationService from "services/verification.service";
import loginRecordService from "services/login-record.service";

// 사용자 정보 등록
const signupUser = asyncWrapper(
  "signupUser",
  "User registration failed. (회원 가입 실패)",
  async (req: Request, res: Response) => {
    const { user } = req.body;

    const {
      birth,
      email,
      phone,
      gender,
      language,
      notifications,
      password,
      profileImage,
      userId,
      username,
      device,
      location,
      ip,
    } = user;

    // user에 대한 필수 값 확인
    if (!email && !phone) {
      throw new BadRequestError(
        "At least one of email or phone is required. (이메일, 휴대폰 중 적어도 하나 필수)",
        "MISSING_USER_IDENTIFIER",
        {
          email: "이메일이 제공되지 않았습니다.",
          phone: "휴대전화 번호가 제공되지 않았습니다.",
        }
      );
    }

    if (!language) {
      throw new BadRequestError(
        "Language setting is required. (언어 설정 필수)",
        "MISSING_LANGUAGE_SETTING",
        { language: "언어 설정이 제공되지 않았습니다." }
      );
    }

    if (!password) {
      throw new BadRequestError(
        "Password is required. (비밀번호 필수)",
        "MISSING_PASSWORD",
        { password: "비밀번호가 제공되지 않았습니다." }
      );
    }

    if (!userId) {
      throw new BadRequestError(
        "User ID is required. (사용자 아이디 필수)",
        "MISSING_USER_ID",
        { userId: "사용자 아이디가 제공되지 않았습니다." }
      );
    }

    if (!username) {
      throw new BadRequestError(
        "Username is required. (사용자의 이름 필수)",
        "MISSING_USERNAME",
        { username: "사용자의 이름이 제공되지 않았습니다." }
      );
    }

    if (!birth.year || !birth.month || !birth.date) {
      throw new BadRequestError(
        "User's birth date (year, month, date) is required. (사용자의 생년월일(year, month, date) 필수)",
        "MISSING_BIRTH_DATE",
        { birth: "생년월일이 제공되지 않았습니다." }
      );
    }

    const { messages, replies, newFollower, posts } = notifications;
    if (
      messages === undefined ||
      replies === undefined ||
      newFollower === undefined ||
      posts === undefined
    ) {
      throw new BadRequestError(
        "Notification settings (messages, replies, newFollower, posts) are required. (알림 설정(messages, replies, newFollower, posts) 필수)",
        "MISSING_NOTIFICATION_SETTINGS",
        { notifications: "알림 설정이 제공되지 않았습니다." }
      );
    }

    const { type, os, browser } = device;
    if (type === undefined || os === undefined || browser === undefined) {
      throw new BadRequestError(
        "Device information (type, os, browser) is required. (기기 정보(type, os, browser) 필수)",
        "MISSING_DEVICE_INFO",
        { device: "기기 정보가 제공되지 않았습니다." }
      );
    }

    const { country, state, city, county } = location;
    if (!country || !state || !city || !county) {
      throw new BadRequestError(
        "Address information (country, state, city, county) is required. (주소 정보(country, state, city, county) 필수)",
        "MISSING_ADDRESS_INFO",
        { location: "주소 정보가 제공되지 않았습니다." }
      );
    }

    if (!ip) {
      throw new BadRequestError(
        "IP information is required. (IP 주소 필수)",
        "MISSING_IP_ADDRESS",
        { ip: "IP 주소가 제공되지 않았습니다." }
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    let uploadedProfileImage: UploadApiResponse[] = [];

    try {
      // 비밀번호 해싱하기
      const hashedPassword = await createHashedPassword(password);

      // 사진 업로드: 다중 업로드되어 있기 때문에 [0]을 적용해야 함 주의!!!
      uploadedProfileImage = await uploadImages(profileImage);

      // 생년월일 합치기
      const birthCombined = combineBirth(birth.year, birth.month, birth.date);

      // 국가
      const countryInfo = extractCountryFromLanguage(language);

      const newUser: IUserInput = {
        password: hashedPassword,
        userId,
        username,
        email,
        birth: birthCombined,
        phone,
        gender,
        country: countryInfo,
        language,
        ip,
        location,
        profileImage: uploadedProfileImage[0]?.secure_url || "",
      };

      const newNotification: INotificationInput = {
        userId,
        pushNotificationSettings: {
          posts: notifications.posts,
          messagesEnabled: notifications.messages,
          replies: notifications.replies ? "all" : "off",
          newFollowersEnabled: notifications.newFollower,
        },
      };

      await userService.initializeUser(
        newUser,
        newNotification,
        userId,
        session
      );

      await session.commitTransaction();

      // 인증 이메일 전송하고 인증 코드 저장
      await verificationService.sendVerificationCode(email, userId);

      const response: IApiSuccessResponse = {
        success: true,
        message: "User registration successful. (회원 가입 성공)",
        code: "USER_REGISTRATION_SUCCESS",
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      if (uploadedProfileImage.length > 0) {
        deleteImages(uploadedProfileImage);
      }
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
);

// 로그인 처리 핸들러
const loginUser = asyncWrapper(
  "loginUser",
  "Login failed. (로그인 실패)",
  async (req: Request, res: Response) => {
    // 요청 바디에서 사용자 정보 추출
    const { email, phone, userId, password, device, ip, location } = req.body;

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
        "MISSING_USER_IDENTIFIER",
        {
          email: "이메일이 제공되지 않았습니다.",
          phone: "휴대전화 번호가 제공되지 않았습니다.",
          userId: "사용자 아이디가 제공되지 않았습니다.",
        }
      );
    }

    // 기기, IP, 장소 중 하나라도 제공되지 않은 경우 BadRequestError 발생
    if (!device || !ip || !location) {
      throw new BadRequestError(
        "Device, IP, and location information is required. (기기, IP, 장소 필수)",
        "MISSING_DEVICE_IP_LOCATION",
        {
          device: "기기 정보가 제공되지 않았습니다.",
          ip: "IP 정보가 제공되지 않았습니다.",
          location: "장소 정보가 제공되지 않았습니다.",
        }
      );
    }

    // 사용자 정보 조회
    const user = await userService.findUserByIdentifier(email, phone, userId);

    // 해당 계정이 잠금 계정인지 여부 확인(유틸)
    verifyAccountLock(user.lockStatus);

    // 비밀번호 검증 및 로그인 실패 처리
    await authService.validatePasswordAndHandleLoginFailure(
      password,
      user.password,
      user.userId,
      device,
      ip,
      location
    );

    // 기존 세션 확인
    const isExistingSession =
      await activeSessionService.checkExistingActiveSession({
        userId: user.userId,
        device,
        ip,
        location,
      });

    // 기존 세션이 있으면 바로 로그인 성공 응답 반환
    if (isExistingSession) {
      return res.status(200).json({
        success: true,
        message: "Login successful. (로그인 성공)",
        code: "LOGIN_SUCCESS", // 추가적으로 코드도 명시
        timestamp: new Date().toISOString(),
      });
    }

    // 새로운 세션 생성 및 토큰 발급
    const { refreshToken, accessToken } =
      await activeSessionService.createSessionAndIssueTokens({
        userId: user.userId,
        device,
        ip,
        location,
        userRole: user.userRole,
      });

    // 새로운 로그인 시도 확인
    const newLoginAttempt = await loginRecordService.detectNewLoginAttempt({
      userId: user.userId,
      device,
      ip,
      location,
    });

    // 로그인 기록을 저장
    await loginRecordService.createLoginRecord({
      userId: user.userId,
      device,
      ip,
      location,
    });

    // 로그인 성공 시 Normal 로그인 실패 삭제
    await loginFailureService.clearNormalLoginFailures(user.userId);

    // access token을 헤더에 저장
    res.setHeader("Authorization", `Bearer ${accessToken}`);

    // refresh token을 쿠키에 저장 (보안 설정 포함)
    res.cookie("refresh", refreshToken, {
      httpOnly: true, // 클라이언트에서 JavaScript로 쿠키 접근 차단
      maxAge:
        (Number(process.env.REFRESHTOKEN_EXPIRES) || REFRESHTOKEN_EXPIRES) *
        1000, // 만료 시간 (밀리초 단위)
      sameSite: "lax", // CSRF 공격 방지 설정
      secure: process.env.NODE_ENV === "production", // 프로덕션 환경에서만 https 사용
    });

    // 새로운 로그인 시도가 있는지 여부 확인
    const hasNewLoginAttempt = Object.values(newLoginAttempt).includes(true);

    // 새로운 로그인 시도가 있으면 true인 키들만 배열로 반환
    const newLoginAttemptDetails = hasNewLoginAttempt
      ? Object.entries(newLoginAttempt)
          .filter(([key, value]) => value === true)
          .map(([key]) => key)
      : [];

    // 로그인 성공 응답
    res.status(200).json({
      success: true,
      message: "Login successful. (로그인 성공)",
      code: "LOGIN_SUCCESS", // 추가적으로 코드도 명시
      timestamp: new Date().toISOString(),
      meta: {
        newLoginAttempt: {
          status: hasNewLoginAttempt,
          details: newLoginAttemptDetails,
        },
      },
    });
  }
);

export { signupUser, loginUser };
