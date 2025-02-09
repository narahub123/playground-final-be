import { LOGINFAILURE_EXPIRES } from "@constants";
import { ipRegExp } from "@data";
import { ILoginFailure } from "@types";
import mongoose from "mongoose";

const LoginFailureSchema = new mongoose.Schema<ILoginFailure>(
  {
    userId: {
      type: String,
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
    failedAt: {
      type: Date,
      default: Date.now,
      expires: Number(process.env.LOGINFAILURE_EXPIRES) || LOGINFAILURE_EXPIRES,
    },
    failureType: {
      type: String,
      enum: ["Normal", "BruteForce"],
      default: "Normal", // 기본값을 'Normal'로 설정
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const LoginFailure = mongoose.model("LoginFailure", LoginFailureSchema);

export default LoginFailure;
