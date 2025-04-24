import { Types } from "mongoose";

interface IVerification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  verificationCode: string;
  createdAt: Date;
}

interface IVerificationInput {
  userId: Types.ObjectId;
  verificationCode: string;
}

export type { IVerification, IVerificationInput };
