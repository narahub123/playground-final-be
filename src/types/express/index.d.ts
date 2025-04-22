import { IUser } from "@types";
import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user: IUser;
      activeSessionId: Types.ObjectId;
    }
  }
}
