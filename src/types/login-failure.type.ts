import { Types } from "mongoose";
import { IDevice } from "./active-session.type";
import { ILocation } from "./user.type";

type LoginFailureType = "Normal" | "BruteForce";

type LoginFailureInput = {
  userId: string;
  device: IDevice;
  ip: string;
  location: ILocation;
  failedAt: Date;
  failureType: LoginFailureType;
};

interface LoginFailure {
  _id: Types.ObjectId;
  userId: string; // User 모델의 ID 참조
  device: IDevice;
  ip: string;
  location: ILocation;
  failedAt: Date;
  failureType: LoginFailureType;
  createdAt: Date;
  updatedAt: Date;
}

export type { LoginFailureInput, LoginFailure, LoginFailureType };
