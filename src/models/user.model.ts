import mongoose from "mongoose";
import {
  birthRegExp,
  emailRegExp,
  ipRegExp,
  phoneRegExp,
  userIdRegExp,
  usernameRegExp,
} from "@data";
import {
  COUNTRY_DEFAULT,
  INTRO_MAX,
  LANGUAGE_DEFAULT,
  USERID_MAX,
  USERID_MIN,
  USERNAME_MAX,
  USERNAME_MIN,
} from "@constants";

const UserSchema = new mongoose.Schema(
  {
    // 비밀번호 : 프론트로 전달 안함
    password: {
      type: String,
      required: true,
    },
    // 사용자 ID
    userId: {
      type: String,
      required: true,
      unique: true,
      minLength: [
        USERID_MIN,
        `사용자 ID는 최소 ${USERID_MIN}자 이상이어야 합니다.`,
      ],
      maxLength: [
        USERID_MAX,
        `사용자 ID는 최대 ${USERID_MAX}자까지 입력할 수 있습니다.`,
      ],
      match: userIdRegExp, // 소문자, 숫자 및 밑줄(_)만 허용
      lowercase: true,
    },
    // 이름
    username: {
      type: String,
      required: true,
      minLength: USERNAME_MIN,
      maxLength: [
        USERNAME_MAX,
        `유저이름 최소 ${USERNAME_MIN}자에서 최대 ${USERNAME_MAX}자까지 가능합니다.`,
      ],
      match: usernameRegExp,
    },
    // 이메일
    email: {
      type: String,
      required: true,
      unique: true,
      match: [emailRegExp, "유효하지 않은 이메일 형식입니다."], // 이메일 유효성 검사
    },
    // 생년월일
    birth: {
      type: String,
      required: true,
      trim: true,
      match: birthRegExp, // YYYYMMDD 형식의 생년월일
    },
    // 전화번호
    phone: {
      type: [String],
      unique: true,
      default: [],
      match: [phoneRegExp, "유효하지 않은 전화번호 형식입니다."],
    },
    // 성별: 남성 여성 새로운 성별 추가 가능
    gender: {
      type: String,
      required: true,
      enum: ["m", "f", "n", "b"], // 남성, 여성, 중성, 양성
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
    // 국가
    country: {
      type: String,
      required: true,
      default: COUNTRY_DEFAULT,
    },
    // 언어
    language: {
      type: String,
      required: true,
      default: LANGUAGE_DEFAULT,
    },
    // 가입시 IP 주소
    ip: {
      type: String,
      required: true,
      match: [ipRegExp, "유효하지 않은 IP 주소 형식입니다."], // IP 주소 유효성 검사
    },
    // 가입시 주소
    location: {
      type: String,
      required: true,
    },
    // 프로필 사진
    profileImage: {
      type: String,
      default: "",
    },
    // 프로필 커버 사진
    profileCoverImage: {
      type: String,
      default: "",
    },
    // 프로필 설명
    intro: {
      type: String,
      default: "",
      trim: true,
      maxLength: [
        INTRO_MAX,
        `프로필 설명은 최대 ${INTRO_MAX}자까지 입력할 수 있습니다.`,
      ],
    },
    // 팔로잉 목록
    following: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    // 팔로워 목록
    followers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    // 뮤트한 유저 목록
    mutedUser: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    // 블록한 유저 목록
    blockedUsers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    // 게시물 공개 여부
    isPrivate: {
      type: Boolean,
      default: false,
    },
    // 유료 개정 여부
    isAuthorized: {
      type: Boolean,
      default: false,
    },
    // 인증 코드 인증 여부
    isAuthenticated: {
      type: Boolean,
      default: false,
    },
    // 소셜 계정
    social: {
      type: [String],
      enum: ["google", "naver", "kakao"],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = mongoose.model("User", UserSchema);

export default User;
