import { Verification } from "@models";
import { IVerification, IVerificationInput } from "@types";
import { mongoDBErrorHandler } from "@utils";
import { Types } from "mongoose";

class VerificationRepository {
  async getVerificationByUserId(
    userId: string
  ): Promise<IVerification | undefined> {
    try {
      const verification = await Verification.findOne({ userId });
      return verification || undefined;
    } catch (error: any) {
      mongoDBErrorHandler("getVerificationCodeByUserId", error, { userId });
    }
  }

  async deleteVerificationById(
    id: Types.ObjectId
  ): Promise<IVerification | undefined> {
    try {
      const verification = await Verification.findByIdAndDelete({ _id: id });
      return verification || undefined;
    } catch (error: any) {
      mongoDBErrorHandler("deleteVerificationById", error, { id });
    }
  }

  async createVerification(
    verification: IVerificationInput
  ): Promise<IVerification | undefined> {
    try {
      const newVerification = await Verification.create(verification);

      return newVerification;
    } catch (error) {
      mongoDBErrorHandler("createVerification", error, { verification });
    }
  }
}

export default new VerificationRepository();
