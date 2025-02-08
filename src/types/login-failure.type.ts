import { DeviceInfoType, LocationType } from "./active-session.type";

type LoginFailureType = {
  userId: string;
  device: DeviceInfoType;
  ip: string;
  location: LocationType;
  failedAt: Date;
  failureType: "Normal" | "BruteForce";
};

export type { LoginFailureType };
