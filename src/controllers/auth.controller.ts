import { Request, Response } from "express";
import { BadRequestError, CustomAPIError } from "@errors";
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
import { INotificationInput, IUserInput } from "@types";
import verificationService from "services/verification.service";
import loginRecordService from "services/login-record.service";
import { loginRecordRepository } from "@repositories";

// 사용자 정보 등록
const signupUser = asyncWrapper(
  "signupUser",
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
      throw new BadRequestError("이메일 혹은 휴대폰이 제공되어야 합니다.");
    } else if (!language) {
      throw new BadRequestError("언어 설정이 제공되어야 합니다.");
    } else if (!password) {
      throw new BadRequestError("비밀번호가 제공되어야 합니다.");
    } else if (!userId) {
      throw new BadRequestError("사용자 아이디가 제공되어야 합니다.");
    } else if (!username) {
      throw new BadRequestError("사용자의 이름이 제공되어야 합니다.");
    } else if (!birth.year || !birth.month || !birth.date) {
      throw new BadRequestError("사용자의 생년월일이 제공되어야 합니다.");
    } else if (
      notifications.messages === undefined ||
      notifications.replies === undefined ||
      notifications.newFollower === undefined ||
      notifications.posts === undefined
    ) {
      throw new BadRequestError("알림 설정이 제공되어야 합니다.");
    } else if (
      device.type === undefined ||
      device.os === undefined ||
      device.browser === undefined
    ) {
      throw new BadRequestError("기기 정보가 제공되어야 합니다.");
    } else if (
      !location.country ||
      !location.state ||
      !location.city ||
      !location.county
    ) {
      throw new BadRequestError("주소 정보가 제공되어야 합니다.");
    } else if (!ip) {
      throw new BadRequestError("IP 정보가 제공되어야 합니다.");
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
      const country = extractCountryFromLanguage(language);

      const newUser: IUserInput = {
        password: hashedPassword,
        userId,
        username,
        email,
        birth: birthCombined,
        phone,
        gender,
        country,
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

      res.status(201).json({ success: true });
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
  async (req: Request, res: Response) => {
    // 요청 바디에서 사용자 정보 추출
    const { email, phone, userId, password, device, ip, location } = req.body;

    // 비밀번호가 제공되지 않은 경우 BadRequestError 발생
    if (!password) {
      throw new BadRequestError("확인할 비밀번호를 제공해주세요.");
    }

    // 이메일, 전화번호, 사용자 ID 중 하나도 제공되지 않은 경우 BadRequestError 발생
    if (!email && !phone && !userId) {
      throw new BadRequestError(
        "이메일, 휴대전화 번호 혹은 사용자 이름을 제공해주세요."
      );
    }

    // 기기, IP, 장소 중 하나라도 제공되지 않은 경우 BadRequestError 발생
    if (!device || !ip || !location) {
      throw new BadRequestError(
        "사용 기기, IP, 장소에 대한 정보를 제공해주세요."
      );
    }

    // 사용자 정보 조회
    const user = await userService.findUserByIdentifier(email, phone, userId);

    // 해당 계정이 잠금 계정인지 여부 확인
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
      return res.status(200).json({ success: true, message: "로그인 성공" });
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
    const savedRecord = await loginRecordRepository.createLoginRecord({
      userId: user.userId,
      device,
      ip,
      location,
    });

    if (!savedRecord) {
      throw new CustomAPIError("로그인 기록 저장에 실패했습니다.");
    }

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
      message: "로그인 성공",
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
