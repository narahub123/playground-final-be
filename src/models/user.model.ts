import mongoose, { Schema, Types } from "mongoose";
import { ipRegExp, userIdRegExp, usernameRegExp } from "@data";
import {
  COUNTRY_DEFAULT,
  INTRO_MAX,
  RECENT_EMOJIS_MAX,
  USERID_MAX,
  USERID_MIN,
  USERNAME_MAX,
  USERNAME_MIN,
} from "@constants";
import { IUser } from "@types";

const UserSchema = new mongoose.Schema<IUser>(
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
    // 생년월일
    birth: {
      year: {
        type: Number,
        required: true,
      },
      month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
      },
      date: {
        type: Number,
        required: true,
        min: 1,
        max: 31,
      },
    },
    // 성별: 남성 여성 중성 양성
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

    // 가입시 IP 주소
    ip: {
      type: String,
      required: true,
      match: [ipRegExp, "유효하지 않은 IP 주소 형식입니다."], // IP 주소 유효성 검사
    },
    // 가입시 위치 정보
    location: {
      // 국가 (필수 항목)
      country: {
        type: String, // 국가 이름은 문자열로 저장
        required: true, // 이 필드는 필수 항목
      },

      // 도, 주(State) (필수 항목)
      state: {
        type: String, // 주 이름은 문자열로 저장
        required: true, // 이 필드는 필수 항목
      },

      // 도시 (필수 항목)
      city: {
        type: String, // 도시 이름은 문자열로 저장
        required: true, // 이 필드는 필수 항목
      },

      // 군/구 (선택 항목)
      county: {
        type: String, // 군/구 이름은 문자열로 저장
        required: false, // 이 필드는 선택 항목
      },
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
    followings: {
      type: [
        {
          user: { type: Schema.Types.ObjectId, ref: "User", required: true },
          followedAt: { type: Date, default: Date.now, required: true },
          _id: false,
        },
      ],
      default: [],
    },
    // 팔로워 목록
    followers: {
      type: [
        {
          user: { type: Schema.Types.ObjectId, ref: "User", required: true },
          followedAt: { type: Date, default: Date.now, required: true },
          _id: false,
        },
      ],
      default: [],
    },

    accountGroup: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
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

    // 계정 잠금 여부에 대한 필드
    lockStatus: {
      // 계정 잠금 상태 (기본값은 false, 즉 잠금되지 않은 상태)
      isLocked: {
        type: Boolean, // 불리언 타입으로 잠금 여부를 나타냄
        default: false, // 기본값은 false (잠금되지 않은 상태)
      },

      // 계정 잠금 사유 (잠금된 경우에만 값이 존재)
      lockReason: {
        type: String, // 잠금 사유는 문자열로 저장
        enum: ["BRUTE_FORCE_DETECTED", "TOO_MANY_LOGIN_FAILURES"], // 허용되는 값은 "BRUTE_FORCE_DETECTED" 또는 "TOO_MANY_LOGIN_FAILURES"
        required: function (this: any): boolean {
          // 계정이 잠금 상태일 때만 lockReason이 필수
          return this.lockStatus.isLocked;
        },
        default: null, // 기본값은 null, 잠금되지 않은 경우에는 null로 설정
      },

      // 계정이 잠금된 시간 (잠금되지 않은 경우에는 null)
      lockedAt: {
        type: Date, // 잠금 시각을 Date 타입으로 저장
        required: function (this: any): boolean {
          // 계정이 잠금 상태일 때만 lockedAt이 필수
          return this.lockStatus.isLocked;
        },
        default: null, // 기본값은 null, 잠금되지 않은 경우에는 null로 설정
      },
    },
    skintoneType: {
      type: String,
      default: "default",
      enum: ["default", "light", "mediumLight", "medium", "mediumDark", "dark"],
    },

    recentEmojis: {
      type: [
        {
          char: { type: String, required: true },
          name: { type: String, required: true },
          skintone: { type: [String], required: false, default: undefined },
          _id: false, // 배열 안에 객체에 자동으로 생성되는 _id 생략
        },
      ],
      validate: {
        validator: function (arr: any[]) {
          return arr.length <= RECENT_EMOJIS_MAX;
        },
      },
      default: [],
    },

    pinnedPost: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = mongoose.model("User", UserSchema);

export default User;
