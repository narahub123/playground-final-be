import { ISecurity } from "@types";
import mongoose from "mongoose";

const SecuritySchema = new mongoose.Schema<ISecurity>(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
      unique: true,
    },
    // 보안
    // 2단계 인증 방법
    twoFactorAuthenticationMethod: {
      type: String,
      default: "",
      enum: ["sms", "app", "key", ""],
    },
    // 인증 라벨 숨기기
    isLabelHidden: { type: Boolean, default: false },
    // 비밀번호 재설정 보호
    isPasswordRenewalProtected: { type: Boolean, default: false },
    // 앱 및 세션
    // 연결된 애플리케이션
    connectedApplications: { type: [String], default: [] },
    // 연결된 계정
    linkedAccounts: { type: [String] },
    // 위임
    // 다른 사용자가 나를 초대할 수 있는지 여부
    isInviteable: { type: Boolean, default: false },
    // 위임
    delegate: {
      // 위임된 그룹
      delegatedGroups: { type: [String], default: [] },
      // 위임된 멤버
      delegatedMembers: { type: [String], default: [] },
    },
  },
  { timestamps: true, versionKey: false }
);

const Security = mongoose.model("Security", SecuritySchema);

export default Security;
