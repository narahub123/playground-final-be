import { DeviceInfoType } from "./active-session.type";
import { ILocation } from "./user.type";

type LoggedOutType = {
  time: Date | null;
  reason: "USER_LOGOUT" | "SESSION_EXPIRED" | "ADMIN_FORCED_LOGOUT";
};

type LoginRecordInput = {
  userId: string;
  ip: string;
  device: DeviceInfoType;
  location: ILocation;
  createdAt: Date;
};

interface LoginRecord {
  userId: string; // User 모델의 ID 참조
  device: DeviceInfoType;
  ip: string;
  location: ILocation;
  loggedInAt: Date;
  loggedOut: LoggedOutType | null;
  createdAt: Date;
  updatedAt: Date;
}

export type { LoginRecordInput, LoginRecord };
