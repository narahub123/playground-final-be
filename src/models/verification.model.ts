import { VERIFICATION_EXPIRES } from "@constants";
import mongoose from "mongoose";

const VerificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
    required: true,
    unique: true,
  },

  authCode: {
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
