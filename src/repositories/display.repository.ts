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
}

export default new DisplayRepository();
