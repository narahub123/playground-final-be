import { userIdRegExp } from "@data";
import { CustomAPIError } from "@errors";
import {
  createActiveSession,
  createLoginFailure,
  deleteLoginFailuresById,
  fetchActiveSessionWithSessionInfo,
  fetchUserByEmail,
  fetchUserByPhone,
  fetchUserByUserId,
  getLoginFailureByUserId,
  updateIsLocked,
} from "@services";
import {
  IDevice,
  ILocation,
  ILoginFailure,
  ILoginFailureInput,
  ILoginRecordInput,
  ILoginRecord,
} from "@types";
import { createLoginRecord } from "services/login-record.service";
import { LockReasonType } from "types/user.type";
import createRefreshToken from "./createRefreshToken";
import { ACCESSTOKEN_EXPIRES, REFRESHTOKEN_EXPIRES } from "@constants";
import createAccessToken from "./createAccessToken";

// 이메일, 전화번호, 사용자 아이디를 기반으로 유저 정보 조회
const findUserByIdentifier = async (
  email?: string,
  phone?: string,
  userId?: string
) => {
  let user;

  // 사용자를 찾기 위한 메서드 배열 정의
  const fetchUserMethods = [
    { key: email, fetch: fetchUserByEmail },
    { key: phone, fetch: fetchUserByPhone },
    { key: userId, fetch: fetchUserByUserId },
  ];

  // 주어진 키(이메일, 전화번호, 사용자 ID)에 대해 유저 정보를 조회
  for (const { key, fetch } of fetchUserMethods) {
    if (key) {
      user = await fetch(key);
      if (user) break; // 사용자를 찾은 경우 반복 종료
    }
  }

  return user;
};

// 로그인 실패 기록 저장
const saveLoginFailure = async (
  userId: string,
  device: IDevice,
  ip: string,
  location: ILocation
) => {
  const newFailure: ILoginFailureInput = {
    userId,
    device,
    ip,
    location,
    failedAt: new Date(),
    failureType: "Normal",
  };

  // 로그인 실패 기록을 저장
  const savedFailure = await createLoginFailure(newFailure);

  if (!savedFailure) throw new CustomAPIError("로그인 실패 기록 저장 실패");
};

// 계정 잠금 처리 (비정상적인 로그인 시도 시)
const lockAccount = async (userId: string, reason: LockReasonType) => {
  await updateIsLocked(userId, { status: true, reason, lockedAt: new Date() });
};

// 세션 생성 및 토큰 발급 (로그인 성공 시)
const createSessionAndTokens = async (
  userId: string,
  userRole: string,
  device: IDevice,
  ip: string,
  location: ILocation
) => {
  // refresh token 생성
  const refreshToken = createRefreshToken(
    userId,
    Number(process.env.REFRESHTOKEN_EXPIRES) || REFRESHTOKEN_EXPIRES
  );

  // 세션 정보 정의
  const sessionInfo = {
    userId,
    refreshToken,
    device,
    ip,
    location,
  };

  // refresh token을 active session에 저장
  const activeSession = await createActiveSession(sessionInfo);

  // 세션 생성 실패 시 에러 발생
  if (!activeSession) {
    throw new CustomAPIError("현재 세션 생성 실패");
  }

  // 유효한 세션 정보를 기반으로 access token 생성
  const accessToken = createAccessToken(
    activeSession._id,
    userId,
    userRole,
    Number(process.env.ACESSTOKEN_EXPIRES) || ACCESSTOKEN_EXPIRES
  );

  return { refreshToken, accessToken };
};

// 새로운 로그인 시도 확인 (기존 기록과 비교)
const checkNewLoginAttempt = async (
  loginRecords: ILoginRecord[],
  device: IDevice,
  ip: string,
  location: ILocation
) => {
  let messages = [];

  // 로그인 기록이 있을 경우, 새로운 로그인 시도 체크
  if (loginRecords.length > 0) {
    // 이전 IP와 비교하여 새로운 IP에서 로그인 시도 여부 확인
    const prevIps = loginRecords.map((record) => record.ip);
    const isNewIp = !prevIps.includes(ip);
    if (isNewIp) {
      messages.push("새로운 IP에서 로그인 시도");
    }

    // 이전 기기와 비교하여 새로운 기기에서 로그인 시도 여부 확인
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

    // 이전 지역과 비교하여 새로운 장소에서 로그인 시도 여부 확인
    const prevLocations = loginRecords.map((record) => record.location);
    const isNewLocation = prevLocations.every(
      (prev) =>
        prev?.country !== location.country || prev?.city !== location.city
    );
    if (isNewLocation) {
      messages.push("새로운 장소에서 로그인 시도가 되었습니다.");
    }
  }

  return messages;
};

// 로그인 기록 저장 (로그인 성공 시)
const saveLoginRecord = async (
  userId: string,
  device: IDevice,
  ip: string,
  location: ILocation
) => {
  const newLoginRecord: ILoginRecordInput = {
    userId,
    ip,
    device,
    location,
  };

  // 로그인 기록을 저장
  const savedRecord = await createLoginRecord(newLoginRecord);

  if (!savedRecord) {
    throw new CustomAPIError("로그인 기록 저장에 실패했습니다.");
  }
};

// 로그인 실패 기록 삭제 (기록 중 'Normal' 실패 타입만 삭제)
const deleteLoginFailures = async (loginFailures: ILoginFailure[]) => {
  // 'Normal' 실패 타입의 기록 ID 추출
  const normalIds = loginFailures
    .filter((failure) => failure.failureType === "Normal")
    .map((failure) => failure._id);

  // 해당 기록 삭제
  await deleteLoginFailuresById(normalIds);
};

export {
  findUserByIdentifier,
  saveLoginFailure,
  lockAccount,
  createSessionAndTokens,
  checkNewLoginAttempt,
  saveLoginRecord,
  deleteLoginFailures,
};
