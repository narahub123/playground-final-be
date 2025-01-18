type OauthType = "google" | "kakao" | "naver";

/**
 * 다양한 OAuth 제공자에서 사용할 수 있는 통합 사용자 데이터 타입
 */
type UserData = {
  email: string; // 사용자의 이메일 주소
  username: string; // 사용자의 이름
  profileImage: string; // 사용자의 프로필 이미지 URL
  gender?: string; // 사용자의 성별 (선택 사항)
  phone?: string; // 사용자의 전화번호 (선택 사항)
  birth?: string; // 사용자의 생일 (선택 사항)
};

export type { OauthType, UserData };
