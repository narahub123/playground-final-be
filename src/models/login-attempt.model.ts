import { ipRegExp } from "@data";
import mongoose from "mongoose";

const LoginAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    loginFailures: [
      {
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
          county: { type: String, required: true },
        },
        failedAt: {
          type: Date,
          default: Date.now,
        },
        failureType: {
          type: String,
          enum: ["Normal", "BruteForce"],
          default: "Normal", // 기본값을 'Normal'로 설정
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const LoginAttempt = mongoose.model("LoginAttempt", LoginAttemptSchema);

export default LoginAttempt;
