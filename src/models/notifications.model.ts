import mongoose from "mongoose";

const NotificationsSchema = new mongoose.Schema(
  {
    // 퀄리티 필터
    qualityFilter: { type: Boolean, default: false },
    //뮤트 알림
    muteNotifications: {
      // 내가 팔로 하지 않는 계정
      notFollowing: { type: Boolean, default: false },
      // 나를 팔로 하지 않는 계정
      notFollower: { type: Boolean, default: false },
      // 새 계정
      newAccount: { type: Boolean, default: false },
      // 기본 프로필
      defaultProfile: { type: Boolean, default: false },
      // 이메일 인증 여부
      emailAuthenticated: { type: Boolean, default: false },
      // 휴대폰 인증 여부
      phoneAuthenticated: { type: Boolean, default: false },
    },
    // 푸시 알림 승인 여부
    pushNotification: { type: Boolean, default: false },
    // 푸시 알림
    pushNotifications: {
      // 게시물
      posts: { type: Boolean },
      // 답변
      replies: {
        type: String,
        default: "custom",
        enum: ["custom", "all", "off"],
      },
      // 재게시물
      reposts: {
        type: String,
        default: "custom",
        enum: ["custom", "all", "off"],
      },
      // 좋아요
      likes: {
        type: String,
        default: "custom",
        enum: ["custom", "all", "off"],
      },
      // 사진 태그
      photoTags: { type: Boolean },
      // 새로운 팔로워
      newFollower: { type: Boolean },
      // 메시지
      messages: { type: Boolean },
      // 메시지 답변
      replyMessage: {
        type: String,
        default: "mine",
        enum: ["mine", "all", "off"],
      },
      // 연락처 안에 사람이 새로 가입
      joinPplInContacts: { type: Boolean },
      // 토픽
      topics: { type: Boolean },
      // 뉴스와 스포츠
      newsAndSports: { type: Boolean },
      // 추천
      recommend: { type: Boolean },
      // 모멘트
      moments: { type: Boolean },
      // 실시간 라이브
      lives: { type: Boolean },
      // 다른 실시간 라이브
      otherLives: { type: Boolean },
      // 알림 및 긴급
      alertAndAgent: { type: Boolean },
      // 프로페셔널
      professional: { type: Boolean },
    },
    // 이메일 알림 승인 여부
    emailNotification: { type: Boolean, default: false },
    // 이메일 알림
    emailNotifications: {
      // 새 알림
      newNotification: { type: Boolean, default: false },
      // 메시지
      messages: { type: Boolean, default: false },
      // 내게 이메일로 전송된 게시물
      postsSentByEmail: { type: Boolean, default: false },
      // 인기 게시물
      popularPosts: {
        type: String,
        default: "off",
        enum: ["daily", "weekly", "frequently", "off"],
      },
      //
      myStatics: { type: Boolean, default: false },
      // PG 업데이트
      PGUpdates: { type: Boolean, default: false },
      // PG 팁
      PGTips: { type: Boolean, default: false },
      // PG 마지막 로그인 후 일어난 일
      PGLatest: { type: Boolean, default: false },
      // PG 파트너
      PGPartners: { type: Boolean, default: false },
      // PG 조사
      PGSurvey: { type: Boolean, default: false },
      // PG 추천 계정
      PGRecommend: { type: Boolean, default: false },
      // PG 최근 팔로우 기반
      PGRecentFollowings: { type: Boolean, default: false },
      // PG 비즈니스
      PGBusiness: { type: Boolean, default: false },
    },
  },
  {
    versionKey: false,
  }
);

const Notifications = mongoose.model("Notifications", NotificationsSchema);

export default Notifications;
