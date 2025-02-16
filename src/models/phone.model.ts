import mongoose from "mongoose";
import { phoneRegExp } from "@data";
import { IPhone } from "@types";

const PhoneSchema = new mongoose.Schema<IPhone>(
  {
    userId: {
      type: String,
      ref: "User",
    },
    phone: {
      type: String,
      unique: true,
      match: [phoneRegExp, "유효하지 않은 전화번호 형식입니다."],
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

const Phone = mongoose.model("Phone", PhoneSchema);

export default Phone;
