import { Request, Response } from "express";
import { asyncWrapper } from "@middlewares";
import {
  BadRequestError,
  CustomAPIError,
  LockedError,
  NotFoundError,
  UnauthorizedError,
} from "@errors";
import {
  fetchUserByEmail,
  fetchUserByPhone,
  fetchUserByUserId,
  updateIsLocked,
} from "services/user.service";
import {
  comparePassword,
  createAccessToken,
  createRefreshToken,
  generateAuthCode,
} from "@utils";
import {
  createActiveSession,
  createLoginFailure,
  createVerification,
  deleteVerificationCode,
  fetchActiveSessionWithSessionInfo,
  fetchVerificationCodeByUserId,
  getLoginFailureByUserId,
  getLoginRecordsByUserId,
  sendEmail,
  updateFailureTypeToBruteForce,
} from "@services";
import {
  ACCESSTOKEN_EXPIRES,
  ACCOUNT_LOCK_THRESHOLD,
  BRUTE_FORCE_THRESHOLD,
  LOGIN_FAILURE_TIME_WINDOW_MS,
  REFRESHTOKEN_EXPIRES,
} from "@constants";
import { LoginFailureType, LoginRecordType } from "@types";
import { createLoginRecord } from "services/login-record.service";

// 로그인 처리 핸들러
const loginWithAccount = asyncWrapper(
  "loginWithAccount",
  async (req: Request, res: Response) => {
    // 요청 바디에서 사용자 정보 추출
    const { email, phone, userId, password, device, ip, location } = req.body;

    // 기존 세션이 존재하는지 확인
    const existingSession = await fetchActiveSessionWithSessionInfo({
      userId,
      device,
      ip,
      location,
    });

    // 기존 세션이 있으면 바로 로그인 성공 응답 반환
    if (existingSession) {
      return res.status(200).json({ success: true, message: "로그인 성공" });
    }

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

    // 사용자 정보를 찾기 위한 메서드 배열 정의
    const fetchUserMethods = [
      { key: email, fetch: fetchUserByEmail },
      { key: phone, fetch: fetchUserByPhone },
      { key: userId, fetch: fetchUserByUserId },
    ];

    let user;

    // 주어진 키(이메일, 전화번호, 사용자 ID)로 사용자 정보 조회
    for (const { key, fetch } of fetchUserMethods) {
      if (key) {
        user = await fetch(key);
        if (user) break; // 사용자를 찾은 경우 반복 종료
      }
    }

    // 사용자를 찾을 수 없으면 NotFoundError 발생
    if (!user) {
      throw new NotFoundError("조건에 맞는 유저를 찾을 수 없습니다.");
    }

    // 해당 계정이 잠금 계정인지 여부 확인
    if (user.isLocked) {
      throw new LockedError(
        "해당 계정은 잠겨 있습니다. 관리자에게 문의하세요.",
        "ACCOUNT_LOCKED"
      );
    }

    // 제공된 비밀번호가 실제 비밀번호와 일치하는지 검증
    const isValid = await comparePassword(password, user.password);

    // 비밀번호가 일치하지 않으면 UnauthorizedError 발생
    if (!isValid) {
      // 로그인 실패 기록 저장하기
      const newFailure: LoginFailureType = {
        userId: user.userId,
        device,
        ip,
        location,
        failedAt: new Date(),
        failureType: "Normal",
      };

      // 로그인 실패 기록 저장하기
      const savedFailure = await createLoginFailure(newFailure);

      if (!savedFailure) {
        throw new CustomAPIError("로그인 실패 기록 저장 실패");
      }

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

          // 계정 잠금 처리 : user 컬렉션에서 isLocked를 true 업데이트
          await updateIsLocked(user.userId, true);

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
          // 계정 잠금 처리 : user 컬렉션에서 isLocked를 true 업데이트
          await updateIsLocked(user.userId, true);

          throw new LockedError(
            "로그인 시도 횟수를 초과하여 계정이 잠겼습니다. 비밀번호 찾기 또는 관리자에게 문의하세요.",
            "TOO_MANY_LOGIN_FAILURES"
          );
        }
      }

      throw new UnauthorizedError("비밀번호가 일치하지 않습니다.");
    }

    // 유효한 비밀번호인 경우, refresh token 생성
    const refreshToken = createRefreshToken(
      userId,
      Number(process.env.REFRESHTOKEN_EXPIRES) || REFRESHTOKEN_EXPIRES
    );

    // 세션 정보를 정의
    const sessionInfo = {
      userId,
      refreshToken,
      device,
      ip,
      location,
    };

    // refresh token을 active session에 저장
    const activeSession = await createActiveSession(sessionInfo);

    // 세션 생성 실패 시 CustomAPIError 발생
    if (!activeSession) {
      throw new CustomAPIError("현재 세션 생성 실패");
    }

    // 유효한 세션 정보로 access token 생성
    const accessToken = createAccessToken(
      activeSession._id,
      user.userId,
      user.userRole,
      Number(process.env.ACESSTOKEN_EXPIRES) || ACCESSTOKEN_EXPIRES
    );

    // access token을 쿠키에 저장 (보안 설정 포함)
    res.cookie("access", accessToken, {
      httpOnly: true, // 클라이언트에서 JavaScript로 쿠키 접근 차단
      maxAge:
        (Number(process.env.ACESSTOKEN_EXPIRES) || ACCESSTOKEN_EXPIRES) * 1000, // 만료 시간 (밀리초 단위)
      sameSite: "lax", // CSRF 공격 방지 설정
      secure: process.env.NODE_ENV === "production", // 프로덕션 환경에서만 https 사용
    });

    // 로그인 보안 정책
    const loginRecords = await getLoginRecordsByUserId(user.userId);

    let messages = [];

    if (loginRecords.length > 0) {
      // 새로운 ip에서 로그인 시도 여부 확인
      const prevIps = loginRecords.map((record) => record.ip);

      const isNewIp = !prevIps.includes(ip);

      if (isNewIp) {
        messages.push("새로운 IP에서 로그인 시도");
      }

      // 새로운 device에서 로그인 시도 여부 확인
      const prevDevices = loginRecords.map((record) => record.device);

      const isNewDevice = prevDevices.every(
        (prev) =>
          prev?.type !== device.type ||
          prev?.os !== device.os ||
          prev?.browser !== device.browser
      );

      if (isNewDevice) {
        messages.push("새로운 기기에서 로그인 시도");
      }

      // 새로운 지역에서 로그인 시도 여부 확인
      const prevLocations = loginRecords.map((record) => record.location);

      const isNewLocation = prevLocations.every(
        (prev) =>
          prev?.country !== location.country || prev?.city !== location.city
      );

      if (isNewLocation) {
        messages.push("새로운 장소에서 로그인 시도가 되었습니다.");
      }
    }

    // 로그인 기록 저장하기
    const newLoginRecord: LoginRecordType = {
      userId: user.userId,
      ip,
      device,
      location,
      createdAt: new Date(),
    };

    const savedRecord = await createLoginRecord(newLoginRecord);

    if (!savedRecord) {
      throw new CustomAPIError("로그인 기록 저장에 실패했습니다.");
    }

    // 로그인 성공 응답
    res.status(200).json({ success: true, message: "로그인 성공" });
  }
);

// 계정 정보로 연락처를 조회하는 API 핸들러
const getContactsByAccount = asyncWrapper(
  "getContactsByAccount",
  async (req: Request, res: Response) => {
    // 요청 본문에서 사용자 ID, 이메일, 전화번호 추출
    const { userId, email, phone } = req.body;

    // 이메일, 휴대 전화 번호, 사용자 아이디 중 하나라도 없으면 BadRequestError 발생
    if (!userId && !email && !phone)
      throw new BadRequestError(
        "이메일, 휴대 전화 번호 혹은 사용자 아이디를 제공해주세요."
      );

    // 이메일, 전화번호, 사용자 ID를 기준으로 사용자를 찾기 위한 메서드 배열 정의
    const fetchUserMethods = [
      { key: email, fetch: fetchUserByEmail }, // 이메일로 사용자 조회
      { key: phone, fetch: fetchUserByPhone }, // 전화번호로 사용자 조회
      { key: userId, fetch: fetchUserByUserId }, // 사용자 ID로 사용자 조회
    ];

    // 주어진 키(email, phone, userId)를 기준으로 사용자 정보 조회
    for (const { key, fetch } of fetchUserMethods) {
      // 키가 존재하는 경우에만 해당 메서드를 사용하여 사용자 정보를 조회
      if (key) {
        const user = await fetch(key);

        // 사용자가 존재하면 이메일과 전화번호 반환
        if (user) {
          return res.status(200).json({
            success: true,
            data: { emails: user.email, phones: user.phone },
          });
        }
      }
    }

    // 모든 조건에 맞는 사용자를 찾지 못한 경우 NotFoundError 발생
    throw new NotFoundError("조건에 맞는 유저를 찾을 수 없습니다.");
  }
);

// 인증 코드 요청 핸들러
const requestVerificationCodeLogin = asyncWrapper(
  "requestVerificationCodeLogin",
  async (req: Request, res: Response) => {
    const { email, phone } = req.body;

    // 이메일 또는 휴대폰 번호가 제공되지 않은 경우
    if (!email && !phone)
      throw new BadRequestError("이메일 혹은 휴대 전화 번호를 제공해주세요.");

    if (email) {
      // 이메일로 인증 코드 전송
      // 이메일을 통해 사용자 정보를 조회
      const user = await fetchUserByEmail(email);

      // 이메일에 해당하는 유저가 없는 경우
      if (!user) throw new NotFoundError("해당 이메일을 가진 유저가 없습니다.");

      // 이미 전송된 인증 코드가 있는지 확인
      const sentVerificationCode = await fetchVerificationCodeByUserId(
        user.userId
      );

      if (sentVerificationCode) {
        // 기존 인증 코드가 있다면 삭제
        await deleteVerificationCode(sentVerificationCode._id);
      }

      // 새로운 인증 코드 생성
      const verificationCode = generateAuthCode();

      // 인증 코드 이메일 제목 및 내용 설정
      const subject = "인증코드";
      const html = `<p>인증코드 ${verificationCode}</p>`;

      // 인증 코드 이메일 전송
      await sendEmail(email, subject, html);

      // 인증 코드와 사용자 정보를 인증 관련 모델에 저장
      await createVerification({ userId: user.userId, verificationCode });
    } else {
      // 휴대폰 인증 코드 전송 부분 (아직 구현되지 않음)
      // SMS 전송 로직은 추후 구현 필요
    }

    // 인증 코드 요청 성공 응답
    res
      .status(200)
      .json({ success: true, message: "인증코드가 전송되었습니다." });
  }
);

const checkVerificationCodeLogin = asyncWrapper(
  "checkVerificationCodeLogin",
  async (req: Request, res: Response) => {
    const { email, phone, userId, verificationCode } = req.body;

    // 필수 입력값 검증
    if (!email && !phone && !userId)
      throw new BadRequestError(
        "이메일, 휴대 전화 번호 혹은 사용자 아이디를 제공해주세요."
      );
    if (!verificationCode)
      throw new BadRequestError("인증 코드를 작성해주세요.");

    // 사용자 조회를 위한 검색 방식 정의
    const fetchUserMethods = [
      { key: email, fetch: fetchUserByEmail },
      { key: phone, fetch: fetchUserByPhone },
      { key: userId, fetch: fetchUserByUserId },
    ];

    // 사용자 조회 및 인증 코드 확인
    for (const { key, fetch } of fetchUserMethods) {
      if (key) {
        const user = await fetch(key);
        if (user) {
          const sentCode = await fetchVerificationCodeByUserId(user.userId);

          // 인증 코드 만료 확인
          if (!sentCode) {
            throw new CustomAPIError(
              "인증코드가 만료되었습니다. 인증 코드를 다시 요청해주세요.",
              410,
              "GONE"
            );
          }

          // 인증 코드 일치 여부 확인
          if (verificationCode === sentCode?.verificationCode) {
            return res
              .status(200)
              .json({ success: true, message: "인증 코드가 확인되었습니다." });
          } else {
            throw new UnauthorizedError(
              "입력하신 정보가 잘못되었습니다. 다시 시도해주세요."
            );
          }
        }
      }
    }

    // 사용자를 찾지 못한 경우 예외 발생
    throw new NotFoundError("조건에 맞는 인증 코드를 찾을 수 없습니다.");
  }
);

export {
  loginWithAccount,
  getContactsByAccount,
  requestVerificationCodeLogin,
  checkVerificationCodeLogin,
};
