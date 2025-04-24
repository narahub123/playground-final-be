import { Document, Types } from "mongoose";
import { ILocation, UserRoleType } from "./user.type";

/**
 * 사용자의 장치 유형을 나타내는 타입입니다.
 *
 * - `"Web"`: 웹에서 접속한 장치
 * - `"Mobile"`: 모바일 장치
 * - `"Tablet"`: 태블릿 장치
 */
type DeviceType = "Web" | "Mobile" | "Tablet";

/**
 * 사용자의 운영 체제를 나타내는 타입입니다.
 *
 * - `"Windows"`: Windows 운영 체제
 * - `"MacOS"`: MacOS 운영 체제
 * - `"Linux"`: Linux 운영 체제
 * - `"Android"`: Android 운영 체제
 * - `"iOS"`: iOS 운영 체제
 * - `"Unknown"`: 알 수 없는 운영 체제
 */
type OSType = "Windows" | "MacOS" | "Linux" | "Android" | "iOS" | "Unknown";

/**
 * 사용자의 브라우저 유형을 나타내는 타입입니다.
 *
 * - `"Chrome"`: Chrome 브라우저
 * - `"Firefox"`: Firefox 브라우저
 * - `"Safari"`: Safari 브라우저
 * - `"Edge"`: Edge 브라우저
 * - `"Opera"`: Opera 브라우저
 * - `"Unknown"`: 알 수 없는 브라우저
 */
type BrowserType =
  | "Chrome"
  | "Firefox"
  | "Safari"
  | "Edge"
  | "Opera"
  | "Unknown";

/**
 * 장치 정보 객체를 나타내는 타입입니다.
 *
 * - `type`: 장치 유형 (`DeviceType`)
 * - `os`: 운영 체제 (`OSType`)
 * - `browser`: 브라우저 유형 (`BrowserType`)
 */
type IDevice = {
  type: DeviceType;
  os: OSType;
  browser: BrowserType;
};

/**
 * 활성 사용자 세션을 나타내는 인터페이스.
 * MongoDB의 Document를 확장하여 세션 정보를 저장합니다.
 */
interface IActiveSession extends Document {
  /**
   * 세션의 고유 ID (MongoDB ObjectId)
   */
  _id: Types.ObjectId;

  /**
   * 세션 소유자의 사용자 ID
   */
  userId: Types.ObjectId;

  /**
   * 사용자 역할 (예: "admin", "user", "moderator" 등)
   */
  userRole: UserRoleType;

  /**
   * 세션을 갱신하는 데 사용되는 Refresh Token
   */
  refreshToken: string;

  /**
   * 사용자의 장치 정보 (선택적)
   */
  device?: IDevice;

  /**
   * 사용자의 IP 주소
   */
  ip: string;

  /**
   * 사용자의 위치 정보 (선택적)
   */
  location?: ILocation;

  /**
   * 세션이 생성된 날짜 및 시간
   */
  sessionCreatedAt: Date;
}

export type { IActiveSession, IDevice };
