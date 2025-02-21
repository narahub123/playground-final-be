import { UserType } from "@types";
import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user: UserType;
      activeSessionId: Types.ObjectId;
    }
  }
}
