import mongoose from "mongoose";

const privacySchema = new mongoose.Schema(
  {
    // 오디언스
    // 게시물 비공개
    isPrivate: { type: Boolean, default: false },
    // 동영상 보호
    protectVideo: { type: Boolean, default: false },
    // 사진 태그하기
    tagging: {
      // 태그 가능 여부
      allow: { type: Boolean, default: false },
      // 태그 가능한 대상
      whom: { type: String, default: "all", enum: ["all", "followers"] },
    },
    // 내 게시물
    // 포스트 할 때 민감한 미디어 표시하기
    tagSensitiveMedia: { type: Boolean, default: false },
    // 게시물에 위치 정보 넣기
    addLocationInfo: { type: Boolean, default: false },
    // 표시되는 콘텐츠
    // 피드에 민감한 미디어 표시하기
    displaySensitiveMedia: { type: Boolean, default: true },
    // 토픽
    topics: { type: [String], default: [] },
    // 관심사
    interests: { type: [String], default: [] },
    // 뮤트 및 차단
    // 뮤트한 단어
    mutedKeywords: { type: [String], default: [] },
    // 뮤트한 단어 추가
    mute: {
      // 홈 피디에서 뮤트 여부
      homeFeed: { type: Boolean, default: false },
      // 알림
      notification: { type: Boolean, default: false },
      // 대상
      target: { type: String, default: "all", enum: ["all", "notFollowing"] },
      // 기간
      duration: {
        type: String,
        default: "forever",
        enum: ["forever", "24h", "7d", "30d"],
      },
    },
    // 메시지
    // 메시지 허용하기
    allowMessages: {
      type: String,
      default: "all",
      enum: ["all", "authenticated", "none"],
    },
    // 저질스러운 메시지 필터링
    filterMessages: { type: Boolean, default: false },
    // 읽음 표시
    showRead: { type: Boolean, default: false },
    // 계정 찾기 및 연락처
    // 이메일로 나를 찾기
    findByEmail: { type: Boolean, default: true },
    // 휴대폰으로 나를 찾기
    findByPhone: { type: Boolean, default: true },
    // 모바일 디바이스에서 가져온 연락처 목록
    contacts: { type: [String], default: [] },
    // 광고 환경 설정
    // 맞춤 광고
    allowBehavioralAds: { type: Boolean, default: true },
    // 광고주
    audiences: { type: [String], default: [] },
    // 위치 정보
    // 장소 기반 설정
    allLocationAds: { type: Boolean, default: false },
    // 방문 장소
    locations: { type: [String], default: [] },
  },
  { versionKey: false }
);

const Privacy = mongoose.model("Privacy", privacySchema);

export default Privacy;
