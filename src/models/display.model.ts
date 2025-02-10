import mongoose from "mongoose";
import { IDisplay } from "types/display.type";

const displaySchema = new mongoose.Schema<IDisplay>(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
      unique: true,
    },

    // 접근성, 표시, 언어
    // 접근성
    // 색 대비
    isColorContrastEnabled: { type: Boolean, default: false },
    // 동작 줄이기
    isMotionReduced: { type: Boolean, default: false },
    // 이미지 설명 추가 알림
    isImageDescriptionAdded: { type: Boolean, default: false },

    // 표시

    // 글꼴 크기
    fontSize: {
      type: String,
      default: "b",
      enum: ["xs", "s", "b", "x", "xl"],
    },

    // 색상 설정
    colorTheme: {
      type: String,
      default: "cornflowerblue",
      enum: ["cornflowerblue", "red", "green", "yellow", "purple", "orange"],
    },

    // 배경 모드
    bgTheme: {
      type: String,
      default: "light",
      enum: ["light", "dark", "darker"],
    },

    // 데이터 사용량
    // 데이터 세이버
    isDataSaverEnabled: { type: Boolean, default: false },

    // 자동 재생
    isAutoplayEnabled: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

const Display = mongoose.model("Display", displaySchema);

export default Display;
