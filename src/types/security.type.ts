import { Types } from "mongoose";
import { IDevice } from "./active-session.type";

interface IDelegate {
  groups: string[];
  members: string[];
}

type TwoFactorAuthenticationType = "sms" | "app" | "key" | "";

interface ISecurity extends Document {
  _id: Types.ObjectId;
  userId: string;
  twoFactorAuthentication: TwoFactorAuthenticationType;
  hideLabel: boolean;
  protectRenewPassword: boolean;
  connectedApps: string[];
  sessions: string[];
  connectedAccounts: string[];
  canBeInvited: boolean;
  delegate: IDelegate;
  createdAt: Date;
  updatedAt: Date;
}

interface ISecurityInput {
  userId: string;
}

export type {
  IDelegate,
  TwoFactorAuthenticationType,
  ISecurity,
  ISecurityInput,
};
