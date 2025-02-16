// 소셜 계정 타입 정의
type SocialType = "google" | "naver" | "kakao";

// Email 모델 타입 정의
interface IEmail extends Document {
  userId: string; // User 모델과 참조
  email: string; // 이메일
  social: SocialType | null; // 소셜 계정 (google, naver, kakao 중 하나 또는 null)
}

interface IEmailInput {
  userId: string;
  email: string; // 이메일
  social?: SocialType;
}

export type { SocialType, IEmail, IEmailInput };
