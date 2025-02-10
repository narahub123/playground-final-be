import { Request, Response } from "express";
import {
  BadRequestError,
  LockedError,
  NotFoundError,
  UnauthorizedError,
} from "@errors";
import { asyncWrapper } from "@middlewares";
import {
  combineBirth,
  comparePassword,
  createHashedPassword,
  createSessionAndTokens,
  deleteImages,
  extractCountryFromLanguage,
  findUserByIdentifier,
  lockAccount,
  saveLoginFailure,
  uploadImages,
} from "@utils";
import {
  createUser,
  createUserDisplay,
  createUserNotifications,
  createUserPrivacy,
  createUserSecurity,
  getActiveSessionByInfo,
  getLoginFailureByUserId,
  getLoginRecordsByUserId,
  updateFailureTypeToBruteForce,
  UserService,
} from "@services";
import { UploadApiResponse } from "cloudinary";
import mongoose from "mongoose";
import {
  ACCOUNT_LOCK_THRESHOLD,
  BRUTE_FORCE_THRESHOLD,
  LOGIN_FAILURE_TIME_WINDOW_MS,
  REFRESHTOKEN_EXPIRES,
} from "@constants";
import {
  checkNewLoginAttempt,
  deleteLoginFailures,
  saveLoginRecord,
} from "utils/loginUtils";
import {
  ILoginFailure,
  ILoginRecord,
  INotificationInput,
  IUserInput,
} from "@types";
import verificationService from "services/verification.service";

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

      await UserService.initializeUser(
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

    // request body에서 받은 데이터의 유효성 검사
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

    const user = await findUserByIdentifier(email, phone, userId);

    // 사용자를 찾을 수 없으면 NotFoundError 발생
    if (!user) {
      throw new NotFoundError("조건에 맞는 유저를 찾을 수 없습니다.");
    }

    // 해당 계정이 잠금 계정인지 여부 확인
    if (user.lockStatus?.isLocked) {
      const { lockReason } = user.lockStatus;

      const errorMessages: Record<string, string> = {
        BRUTE_FORCE_DETECTED:
          "비정상적인 로그인 시도가 감지되어 잠긴 계정입니다. 로그인을 위해서는 관리자에게 문의하세요.",
        TOO_MANY_LOGIN_FAILURES:
          "로그인 시도 횟수를 초과하여 잠긴 계정입니다. 비밀번호 찾기 또는 관리자에게 문의하세요.",
      };

      if (lockReason && errorMessages[lockReason]) {
        throw new LockedError(errorMessages[lockReason], lockReason);
      }
    }

    // 제공된 비밀번호가 실제 비밀번호와 일치하는지 검증
    const isValid = await comparePassword(password, user.password);

    // 비밀번호가 일치하지 않으면 UnauthorizedError 발생
    if (!isValid) {
      // 로그인 실패 기록 저장하기
      await saveLoginFailure(user.userId, device, ip, location);

      // 해당 유저의 로그인 실패 기록 가져오기
      const loginFailures = await getLoginFailureByUserId(user.userId);

      if (loginFailures.length > 0) {
        // 최근 특정 시간 내에 실패한 횟수 확인
        const failureCountInHour = loginFailures.filter(
          (failure) =>
            failure.failedAt.getTime() >
            Date.now() - LOGIN_FAILURE_TIME_WINDOW_MS
        );

        // 최근 특정 시간 내에 실패한 횟수가 일정 이상이면 BruteForce로 변경
        if (failureCountInHour.length >= BRUTE_FORCE_THRESHOLD) {
          const bruteForceIds = failureCountInHour.map(
            (failure) => failure._id
          );

          // BruteForce로 변경 (DB 반영)
          await updateFailureTypeToBruteForce(bruteForceIds);

          // 계정 잠금 처리 : user 컬렉션에서 lockStatus의 status를 true로, reason의 BRUTE_FORCE_DETECTED로 업데이트
          await lockAccount(user.userId, "BRUTE_FORCE_DETECTED");

          throw new LockedError(
            "비정상적인 로그인 시도가 감지되어 계정이 잠깁니다. 로그인을 위해서는 관리자에게 문의하세요.",
            "BRUTE_FORCE_DETECTED"
          );
        }

        // 전체 로그인 실패 횟수가 일정 이상이면 계정 잠금 처리
        const normalFailureCount = loginFailures.reduce(
          (count, failure) =>
            count + (failure.failureType === "Normal" ? 1 : 0),
          0
        );

        if (normalFailureCount >= ACCOUNT_LOCK_THRESHOLD) {
          // 계정 잠금 처리 : user 컬렉션에서 lockStatus의 status를 true로, reason의 TOO_MANY_LOGIN_FAILURES로 업데이트
          await lockAccount(user.userId, "TOO_MANY_LOGIN_FAILURES");

          throw new LockedError(
            "로그인 시도 횟수를 초과하여 계정이 잠겼습니다. 비밀번호 찾기 또는 관리자에게 문의하세요.",
            "TOO_MANY_LOGIN_FAILURES"
          );
        }
      }

      throw new UnauthorizedError("비밀번호가 일치하지 않습니다.");
    }

    // 기존 세션이 존재하는지 확인
    const existingSession = await getActiveSessionByInfo({
      userId: user.userId,
      device,
      ip,
      location,
    });

    // 기존 세션이 있으면 바로 로그인 성공 응답 반환
    if (existingSession) {
      return res.status(200).json({ success: true, message: "로그인 성공" });
    }

    // 세션 생성과 토큰 발급
    const { refreshToken, accessToken } = await createSessionAndTokens(
      user.userId,
      user.userRole,
      device,
      ip,
      location
    );

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

    const loginRecords = await getLoginRecordsByUserId(userId);

    // 새로운 로그인 시도 확인
    const messages = await checkNewLoginAttempt(
      loginRecords as ILoginRecord[],
      device,
      ip,
      location
    );

    // 로그인 기록 저장하기
    await saveLoginRecord(user.userId, device, ip, location);

    // 실패 유형이 Normal인 것만 삭제, BruteForce을 유지
    const loginFailures = await getLoginFailureByUserId(userId);

    // 로그인 실패 기록 삭제하기
    await deleteLoginFailures(loginFailures as ILoginFailure[]);

    // 로그인 성공 응답
    res.status(200).json({ success: true, message: "로그인 성공" });
  }
);

export { signupUser, loginUser };
