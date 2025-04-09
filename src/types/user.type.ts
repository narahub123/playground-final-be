import { Document } from "mongoose";

/**
 * 성별을 나타내는 타입입니다.
 *
 * - `"m"`: 남성
 * - `"f"`: 여성
 * - `"n"`: 중성
 * - `"b"`: 양성
 */
type GenderType = "m" | "f" | "n" | "b";

/**
 * 사용자의 역할을 나타내는 타입입니다.
 *
 * - `"ADMIN"`: 관리자로 권한이 있는 사용자
 * - `"USER"`: 일반 사용자
 */
type UserRoleType = "ADMIN" | "USER";

/**
 * 위치 정보를 나타내는 인터페이스
 * @interface ILocation
 */
interface ILocation {
  /**
   * 국가 정보
   * @type {string}
   * @required
   */
  country: string;

  /**
   * 주(state) 정보
   * @type {string}
   * @required
   */
  state: string;

  /**
   * 도시 정보
   * @type {string}
   * @required
   */
  city: string;

  /**
   * 군/구 정보 (선택 사항)
   * @type {string | undefined}
   * @optional
   */
  county?: string;
}

/**
 * 소셜 로그인 제공자를 나타내는 타입입니다.
 *
 * - `"google"`: 구글 소셜 로그인
 * - `"naver"`: 네이버 소셜 로그인
 * - `"kakao"`: 카카오 소셜 로그인
 */
type SocialType = "google" | "naver" | "kakao";

/**
 * @typedef {"BRUTE_FORCE_DETECTED" | "TOO_MANY_LOGIN_FAILURES"} LockReasonType
 * @description
 * 이 타입은 계정 잠금의 원인을 나타냅니다.
 * - "BRUTE_FORCE_DETECTED": 다수의 로그인 실패 시도를 탐지한 경우
 * - "TOO_MANY_LOGIN_FAILURES": 일정 기간 내에 로그인 실패가 너무 많았을 경우
 */
type LockReasonType = "BRUTE_FORCE_DETECTED" | "TOO_MANY_LOGIN_FAILURES";

/**
 * 계정 잠금 상태 정보를 나타내는 인터페이스
 * @interface ILockStatus
 */
interface ILockStatus {
  /**
   * 계정 잠금 상태
   * @type {boolean}
   * @required
   */
  isLocked: boolean;

  /**
   * 잠금 사유
   * @type {"BRUTE_FORCE_DETECTED" | "TOO_MANY_LOGIN_FAILURES" | null}
   * @required
   */
  lockReason: "BRUTE_FORCE_DETECTED" | "TOO_MANY_LOGIN_FAILURES" | null;

  /**
   * 잠금 시간
   * @type {Date | null}
   * @required
   */
  lockedAt: Date | null;
}

interface IBirth {
  year: number;
  month: number;
  date: number;
}

type SkintoneType =
  | "default"
  | "light"
  | "mediumLight"
  | "medium"
  | "mediumDark"
  | "dark";

interface IEmoji {
  char: string;
  name: string;
  skintone?: string[];
}

// User 모델에 대한 타입 정의
interface IUser extends Document {
  password: string;
  userId: string;
  username: string;
  birth: IBirth;
  gender: GenderType;
  userRole: UserRoleType;
  country: string;
  ip: string;
  location: ILocation;
  profileImage: string;
  profileCoverImage: string;
  intro: string;
  accountGroup: string[];
  followings: string[];
  followers: string[];
  isAuthorized: boolean;
  isAuthenticated: boolean;
  lockStatus: ILockStatus;
  skintoneType: SkintoneType;
  recentEmojis: IEmoji[];
}

interface IUserInput {
  password: string;
  userId: string;
  username: string;
  birth: IBirth;
  gender: GenderType;
  country: string;
  ip: string;
  location: ILocation;
  profileImage: string;
  accountGroup: string[];
}

interface UserDTO {
  skintoneType: SkintoneType;
}

export type {
  IUser,
  LockReasonType,
  ILockStatus,
  ILocation,
  GenderType,
  UserRoleType,
  SocialType,
  IUserInput,
  IBirth,
  SkintoneType,
  UserDTO,
};
