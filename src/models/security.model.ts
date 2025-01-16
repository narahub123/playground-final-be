import mongoose from "mongoose";

const securitySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
      unique: true,
    },
    // 보안
    // 2단계 인증
    twoFactorAuthentication: {
      type: String,
      default: "",
      enum: ["sms", "app", "key", ""],
    },
    // 인증 라벨 숨기기
    hideLabel: { type: Boolean, default: false },
    // 비밀번호 재설정 보호
    protectRenewPassword: { type: Boolean, default: false },
    // 앱 및 세션
    // 연결된 앱
    connectedApps: { type: [String], default: [] },
    // 세션
    sessions: { type: [String], default: [] },
    // 로그인 기록
    loginHistory: { type: [String], default: [] },
    // 로그인된 디바이스 및 앱
    devices: {
      type: [
        {
          type: {
            type: String,
            enum: ["Web", "Mobile", "Tablet"],
            required: true,
          },
          os: {
            type: String,
            enum: ["Windows", "MacOs", "Linux", "Android", "iOS", "Unknown"],
            required: true,
          },
          browser: {
            type: String,
            enum: ["Chrome", "Firefox", "Safari", "Edge", "Opera", "Unknown"],
            required: true,
          },
          lastLog: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    // 연결된 계정
    connectedAccounts: { type: [String] },
    // 위임
    // 다른 사용자가 나를 초대 가능 여부
    canBeInvited: { type: Boolean, default: false },
    // 위임
    delegate: {
      // 그룹
      groups: { type: [String], default: [] },
      // 멤버
      members: { type: [String], default: [] },
    },
  },
  { timestamps: true, versionKey: false }
);

const Security = mongoose.model("Security", securitySchema);

export default Security;
