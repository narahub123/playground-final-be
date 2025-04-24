import { LOGINRECORD_EXPIRES } from "@constants";
import { ipRegExp } from "@data";
import { ILoginRecord } from "@types";
import mongoose, { Schema } from "mongoose";

const LoginRecordSchema = new mongoose.Schema<ILoginRecord>(
  {
    activeSessionId: {
      type: Schema.Types.ObjectId,
      ref: "ActiveSession",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    device: {
      type: {
        type: String,
        enum: ["Web", "Mobile", "Tablet"],
        required: true,
      },
      os: {
        type: String,
        enum: ["Windows", "MacOS", "Linux", "Android", "iOS", "Unknown"],
        required: true,
      },
      browser: {
        type: String,
        enum: ["Chrome", "Firefox", "Safari", "Edge", "Opera", "Unknown"],
        required: true,
      },
    },
    ip: {
      type: String,
      required: true,
      match: [ipRegExp, "유효하지 않은 IP 주소 형식입니다."], // IP 주소 유효성 검사
    },
    location: {
      country: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      county: { type: String, required: false },
    },
    loggedInAt: {
      type: Date,
      default: Date.now,
      expires: Number(process.env.LOGINRECORD_EXPIRES) || LOGINRECORD_EXPIRES,
    }, // 6개월 후 작동 삭제
    logoutInfo: {
      type: {
        loggedOutAt: {
          type: Date,
          default: null,
        },
        reason: {
          type: String,
          enum: ["USER_LOGOUT", "SESSION_EXPIRED", "ADMIN_FORCED_LOGOUT"],
          default: "USER_LOGOUT",
        },
      },
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const LoginRecord = mongoose.model("LoginRecord", LoginRecordSchema);

export default LoginRecord;
