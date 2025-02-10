import { Types } from "mongoose";

interface IVerification extends Document {
  _id: Types.ObjectId;
  userId: string;
  verificationCode: string;
  createdAt: Date;
}

interface IVerificationInput {
  userId: string;
  verificationCode: string;
}

export type { IVerification, IVerificationInput };
