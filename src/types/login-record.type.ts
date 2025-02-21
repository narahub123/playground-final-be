import { Document } from "mongoose";
import { IDevice, ILocation } from "@types";

/**
 * 로그인 기록을 생성할 때 필요한 입력 데이터
 */
interface ILoginRecordInput {
  /** 사용자 ID */
  userId: string;

  /** 사용자 IP 주소 */
  ip: string;

  /** 사용자 장치 정보 */
  device: IDevice;

  /** 사용자 위치 정보 */
  location: ILocation;
}

/**
 * 로그아웃 이유를 정의한 타입
 *
 * - `USER_LOGOUT`: 사용자가 정상적으로 로그아웃
 * - `SESSION_EXPIRED`: 세션 만료로 인한 로그아웃
 * - `ADMIN_FORCED_LOGOUT`: 관리자가 강제로 로그아웃
 */
type LogoutReasonType =
  | "USER_LOGOUT"
  | "SESSION_EXPIRED"
  | "ADMIN_FORCED_LOGOUT";

/**
 * 사용자가 로그아웃한 정보
 */
interface ILogoutInfo {
  /** 로그아웃 시간 */
  loggedOutAt: Date | null;

  /** 로그아웃 이유 */
  reason: LogoutReasonType;
}

/**
 * 로그인 기록을 나타내는 인터페이스
 */
interface ILoginRecord extends Document {
  /** 사용자 ID */
  userId: string;

  /** 사용자 장치 정보 */
  device: IDevice;

  /** 사용자 IP 주소 */
  ip: string;

  /** 사용자 위치 정보 */
  location: ILocation;

  /** 로그인 시간 */
  loggedInAt: Date;

  /** 로그아웃 정보 (로그아웃하지 않았다면 null) */
  logoutInfo: ILogoutInfo | null;
}

export type { ILoginRecordInput, ILoginRecord, ILogoutInfo, LogoutReasonType };
