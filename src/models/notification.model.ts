import { INotification } from "@types";
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema<INotification>(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
      unique: true,
    },
    // 퀄리티 필터
    isQualityFilterEnabled: { type: Boolean, default: false },

    //뮤트 알림
    isNotificationMuted: { type: Boolean, default: false },

    notificationMuteRules: {
      isMutedForNotFollowing: { type: Boolean, default: false }, // 내가 팔로우하지 않는 계정에 대한 알림 뮤트
      isMutedForNotFollower: { type: Boolean, default: false }, // 나를 팔로우하지 않는 계정에 대한 알림 뮤트
      isMutedForNewAccount: { type: Boolean, default: false }, // 새 계정에 대한 알림 뮤트
      isMutedForDefaultProfile: { type: Boolean, default: false }, // 기본 프로필에 대한 알림 뮤트
      isMutedForEmailAuthenticated: { type: Boolean, default: false }, // 이메일 인증 여부에 대한 알림 뮤트
      isMutedForPhoneAuthenticated: { type: Boolean, default: false }, // 휴대폰 인증 여부에 대한 알림 뮤트
    },

    // 푸시 알림
    isPushNotificationEnabled: { type: Boolean, default: true }, // 푸시 알림 승인 여부

    pushNotificationSettings: {
      posts: { type: Boolean, default: false }, // 게시물 알림 여부
      replies: {
        type: String,
        default: "off",
        enum: ["custom", "all", "off"], // 답변 알림 설정
      },
      reposts: {
        type: String,
        default: "off",
        enum: ["custom", "all", "off"], // 재게시물 알림 설정
      },
      likes: {
        type: String,
        default: "off",
        enum: ["custom", "all", "off"], // 좋아요 알림 설정
      },
      photoTagsEnabled: { type: Boolean, default: false }, // 사진 태그 알림 여부
      newFollowersEnabled: { type: Boolean, default: false }, // 새로운 팔로워 알림 여부
      messagesEnabled: { type: Boolean, default: false }, // 메시지 알림 여부
      replyMessages: {
        type: String,
        default: "mine",
        enum: ["mine", "all", "off"], // 메시지 답변 알림 설정
      },
      newContactsJoined: { type: Boolean, default: false }, // 연락처 안의 새 가입자 알림 여부
      topicsEnabled: { type: Boolean, default: false }, // 토픽 관련 알림 여부
      newsAndSportsEnabled: { type: Boolean, default: false }, // 뉴스와 스포츠 관련 알림 여부
      recommendationsEnabled: { type: Boolean, default: false }, // 추천 관련 알림 여부
      momentsEnabled: { type: Boolean, default: false }, // 모멘트 관련 알림 여부
      liveStreamsEnabled: { type: Boolean, default: false }, // 실시간 라이브 알림 여부
      otherLiveStreamsEnabled: { type: Boolean, default: false }, // 다른 실시간 라이브 알림 여부
      alertsAndUrgentEnabled: { type: Boolean, default: false }, // 알림 및 긴급 알림 여부
      professionalUpdatesEnabled: { type: Boolean, default: false }, // 프로페셔널 관련 알림 여부
    },

    // 이메일 알림
    isEmailNotificationEnabled: { type: Boolean, default: true }, // 이메일 알림 승인 여부

    emailNotificationSettings: {
      newNotificationEnabled: { type: Boolean, default: false }, // 새 알림에 대한 이메일 알림 여부
      messagesEnabled: { type: Boolean, default: false }, // 메시지 알림에 대한 이메일 알림 여부
      postsSentByEmailEnabled: { type: Boolean, default: false }, // 내게 이메일로 전송된 게시물 알림 여부
      popularPosts: {
        type: String,
        default: "off",
        enum: ["daily", "weekly", "frequently", "off"], // 인기 게시물에 대한 이메일 알림 설정
      },
    },

    emailSpecialNotifications: {
      myStatisticsEnabled: { type: Boolean, default: false }, // 내 통계에 대한 이메일 알림 여부
      pgUpdatesEnabled: { type: Boolean, default: false }, // PG 업데이트에 대한 이메일 알림 여부
      pgTipsEnabled: { type: Boolean, default: false }, // PG 팁에 대한 이메일 알림 여부
      pgRecentActivityEnabled: { type: Boolean, default: false }, // 최근 로그인 후 활동 알림 여부
      pgPartnersEnabled: { type: Boolean, default: false }, // PG 파트너에 대한 이메일 알림 여부
      pgSurveyEnabled: { type: Boolean, default: false }, // PG 조사에 대한 이메일 알림 여부
      pgRecommendedAccountsEnabled: { type: Boolean, default: false }, // PG 추천 계정에 대한 이메일 알림 여부
      pgRecentFollowingsEnabled: { type: Boolean, default: false }, // 최근 팔로우 기반 알림 여부
      pgBusinessNewsEnabled: { type: Boolean, default: false }, // PG 비즈니스 뉴스 알림 여부
    },
  },
  { timestamps: true, versionKey: false }
);

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;
