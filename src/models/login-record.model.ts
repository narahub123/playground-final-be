import { LOGINRECORD_EXPIRES } from "@constants";
import { ipRegExp } from "@data";
import mongoose from "mongoose";

const LoginRecordSchema = new mongoose.Schema(
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
    createdAt: {
      type: Date,
      default: Date.now,
      expires: Number(process.env.LOGINRECORD_EXPIRES) || LOGINRECORD_EXPIRES,
    }, // 6개월 후 작동 삭제
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const LoginRecord = mongoose.model("LoginRecord", LoginRecordSchema);

export default LoginRecord;
