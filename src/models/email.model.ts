import { emailRegExp } from "@data";
import { IEmail } from "@types";
import mongoose from "mongoose";

const EmailSchema = new mongoose.Schema<IEmail>(
  {
    userId: {
      type: String,
      ref: "User",
    },
    email: {
      type: String,
      unique: true,
      match: [emailRegExp, "유효하지 않은 이메일 형식입니다."], // 이메일 유효성 검사
    },
    // 소셜 계정
    social: {
      type: String,
      enum: ["google", "naver", "kakao"],
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Email = mongoose.model("Email", EmailSchema);

export default Email;
