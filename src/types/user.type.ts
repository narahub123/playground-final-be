import { Document } from "mongoose";
type IsLockedReasonType =
  | "BRUTE_FORCE_DETECTED"
  | "TOO_MANY_LOGIN_FAILURES"
  | "NONE";

type IsLockedType = {
  status: boolean;
  reason: IsLockedReasonType;
  lockedAt: Date;
};

interface ILocation {
  country: string;
  state: string;
  city: string;
  county?: string;
}

/**
 * @typedef {"BRUTE_FORCE_DETECTED" | "TOO_MANY_LOGIN_FAILURES"} LockReasonType
 * @description
 * 이 타입은 계정 잠금의 원인을 나타냅니다.
 * - "BRUTE_FORCE_DETECTED": 다수의 로그인 실패 시도를 탐지한 경우
 * - "TOO_MANY_LOGIN_FAILURES": 일정 기간 내에 로그인 실패가 너무 많았을 경우
 */
type LockReasonType = "BRUTE_FORCE_DETECTED" | "TOO_MANY_LOGIN_FAILURES";

/**
 * @interface ILockStatus
 * @description
 * 이 인터페이스는 사용자의 계정 잠금 상태를 나타냅니다.
 * - `isLocked`: 계정이 잠금 상태인지 여부
 * - `lockReason`: 계정 잠금 사유. 잠금되지 않은 경우 `null`일 수 있음
 * - `lockedAt`: 계정이 잠금된 시각. 잠금되지 않은 경우 `null`일 수 있음
 */
interface ILockStatus {
  isLocked: boolean;
  lockReason: LockReasonType | null;
  lockedAt: Date | null;
}

// User 모델에 대한 타입 정의
interface IUser extends Document {
  password: string;
  userId: string;
  username: string;
  email: string[];
  birth: string;
  phone: string[];
  gender: "m" | "f" | "n" | "b" | null;
  userRole: "ADMIN" | "USER";
  country: string;
  language: string;
  ip: string;
  location: ILocation;
  profileImage: string;
  profileCoverImage: string;
  intro: string;
  followings: string[];
  followers: string[];
  mutedUsers: string[];
  blockedUsers: string[];
  isPrivate: boolean;
  isAuthorized: boolean;
  isAuthenticated: boolean;
  social: ("google" | "naver" | "kakao")[];
  lockStatus: ILockStatus;
}

export type {
  IsLockedType,
  IsLockedReasonType,
  IUser,
  LockReasonType,
  ILockStatus,
};
