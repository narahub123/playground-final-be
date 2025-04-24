import { Types } from "mongoose";

interface IDelegate {
  groups: string[];
  members: string[];
}

type twoFactorAuthenticationMethodType = "sms" | "app" | "key" | "";

interface ISecurity extends Document {
  userId: Types.ObjectId;
  twoFactorAuthenticationMethod: twoFactorAuthenticationMethodType;
  isLabelHidden: boolean;
  isPasswordRenewalProtected: boolean;
  connectedApplications: string[];
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
