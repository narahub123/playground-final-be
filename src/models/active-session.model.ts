import mongoose from "mongoose";
import { ipRegExp } from "@data";
import { REFRESHTOKEN_EXPIRES } from "@constants";

const ActiveSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
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
    createdAt: {
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
