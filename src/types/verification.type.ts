interface IVerification extends Document {
  userId: string;
  verificationCode: string;
  createdAt: Date;
}

export type { IVerification };
