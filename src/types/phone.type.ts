import { Document } from "mongoose";
import { SocialType } from "./email.type";

// Email 모델 타입 정의
interface IPhone extends Document {
  userId: string; // User 모델과 참조
  phone: string; // 이메일
  social: SocialType | null; // 소셜 계정 (google, naver, kakao 중 하나 또는 null)
}

interface IPhoneInput {
  userId: string;
  phone: string; // 이메일
  social?: SocialType;
}

export { IPhone, IPhoneInput };
