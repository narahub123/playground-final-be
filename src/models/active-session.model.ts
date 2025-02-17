import mongoose from "mongoose";
import { ipRegExp } from "@data";
import { REFRESHTOKEN_EXPIRES } from "@constants";
import { IActiveSession } from "@types";

const ActiveSessionSchema = new mongoose.Schema<IActiveSession>(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    // 사용자 등급
    userRole: {
      type: String,
      enum: {
        values: ["ADMIN", "USER"],
        message: `{VALUE}는 지원되지 않는 사용자 등급입니다.`,
      },
      default: "USER", // 기본값은 "USER"
      uppercase: true,
    },
    refreshToken: {
      type: String,
      unique: true,
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
    sessionCreatedAt: {
      type: Date,
      default: Date.now,
      index: {
        expires:
          Number(process.env.REFRESHTOKEN_EXPIRES) || REFRESHTOKEN_EXPIRES,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ActiveSession = mongoose.model("ActiveSession", ActiveSessionSchema);

export default ActiveSession;
