import { Display } from "@models";
import { IDisplay } from "@types";
import { mongoDBErrorHandler } from "@utils";
import mongoose from "mongoose";

class DisplayRepository {
  async createDisplay(
    userId: string,
    options?: { session?: mongoose.ClientSession }
  ): Promise<IDisplay | undefined> {
    try {
      const newDisplay = await Display.create([{ userId }], options);

      return newDisplay[0] || undefined;
    } catch (error) {
      mongoDBErrorHandler("createDisplay", error, { userId });
    }
  }
}

export default new DisplayRepository();
