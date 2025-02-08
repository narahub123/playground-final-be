import { DeviceInfoType, LocationType } from "./active-session.type";

type LoginFailureType = {
  device: DeviceInfoType;
  ip: string;
  location: LocationType;
  failedAt: Date;
  failureType: "Normal" | "BruteForce";
};

type LoginAttemptType = LoginFailureType & { userId: string };

export type { LoginFailureType, LoginAttemptType };
