import { DeviceInfoType, LocationType } from "./active-session.type";

type LoginRecordType = {
  userId: string;
  ip: string;
  device: DeviceInfoType;
  location: LocationType;
  createdAt: Date;
};

export type { LoginRecordType };
