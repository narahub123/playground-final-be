import { Document, Types } from "mongoose";
import { IDevice, ILocation } from "@types";

/**
 * 로그인 실패 유형을 정의한 타입
 *
 * - `Normal`: 일반적인 로그인 실패
 * - `BruteForce`: 브루트 포스 공격에 의한 로그인 실패
 */
type LoginFailureType = "Normal" | "BruteForce";

/**
 * 로그인 실패 입력 데이터
 */
interface ILoginFailureInput {
  /** 사용자 ID */
  userId: string;

  /** 사용자 장치 정보 */
  device: IDevice;

  /** 사용자 IP 주소 */
  ip: string;

  /** 사용자 위치 정보 */
  location: ILocation;
}

/**
 * 로그인 실패 기록을 나타내는 인터페이스
 */
interface ILoginFailure extends Document {
  /** 로그인 실패 기록의 고유 ID */
  _id: Types.ObjectId;

  /** 사용자 ID */
  userId: string;

  /** 사용자 장치 정보 */
  device: IDevice;

  /** 사용자 IP 주소 */
  ip: string;

  /** 사용자 위치 정보 */
  location: ILocation;

  /** 로그인 실패 시간 */
  failedAt: Date;

  /** 로그인 실패 유형 */
  failureType: LoginFailureType;
}

export type { ILoginFailureInput, ILoginFailure, LoginFailureType };
