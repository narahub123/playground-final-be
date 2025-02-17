import { Display } from "@models";
import { IDisplay, IDisplayInput } from "@types";
import { mongoDBErrorHandler } from "@utils";
import mongoose from "mongoose";

class DisplayRepository {
  async createDisplay(
    display: IDisplayInput,
    options?: { session?: mongoose.ClientSession }
  ): Promise<IDisplay | undefined> {
    try {
      const newDisplay = await Display.create([display], options);

      return newDisplay[0] || undefined;
    } catch (error) {
      mongoDBErrorHandler("createDisplay", error, { display });
    }
  }

  async getDisplayByUserId(userId: string): Promise<IDisplay | null> {
    try {
      const display = await Display.findOne({ userId });

      return display;
    } catch (error) {
      mongoDBErrorHandler("getDisplayByUserId", error, { userId });
      return null;
    }
  }
}

export default new DisplayRepository();
