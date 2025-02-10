import { Types } from "mongoose";
import { IDevice } from "./active-session.type";

interface IDelegate {
  groups: string[];
  members: string[];
}

type twoFactorAuthenticationMethodType = "sms" | "app" | "key" | "";

interface ISecurity extends Document {
  userId: string;
  twoFactorAuthenticationMethod: twoFactorAuthenticationMethodType;
  isLabelHidden: boolean;
  isPasswordRenewalProtected: boolean;
  connectedApplications: string[];
  activeSessions: string[];
  linkedAccounts: string[];
  isInviteable: boolean;
  delegate: {
    delegatedGroups: string[];
    delegatedMembers: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export type { IDelegate, twoFactorAuthenticationMethodType, ISecurity };
