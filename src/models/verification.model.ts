import { VERIFICATION_EXPIRES } from "@constants";
import { IVerification } from "@types";
import mongoose from "mongoose";

const VerificationSchema = new mongoose.Schema<IVerification>({
  userId: {
    type: String,
    ref: "User",
    required: true,
    unique: true,
  },

  verificationCode: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: `${VERIFICATION_EXPIRES}` },
  },
});

const Verification = mongoose.model("Verification", VerificationSchema);

export default Verification;
