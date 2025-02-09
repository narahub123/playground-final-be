import { Document } from "mongoose";
import { ILocation } from "./user.type";

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
 * 활성 세션 정보를 나타내는 인터페이스입니다.
 *
 * - `userId`: 사용자 ID (문서의 `userId`)
 * - `refreshToken`: 리프레시 토큰
 * - `device`: 장치 정보 (`IDevice`)
 * - `ip`: 접속한 IP 주소
 * - `location`: 사용자 위치 정보 (`ILocation`)
 * - `createdAt`: 세션 생성 시간
 */
interface IActiveSession extends Document {
  userId: string;
  refreshToken: string;
  device: IDevice;
  ip: string;
  location: ILocation;
  createdAt: Date;
}

export type { IActiveSession, IDevice };
