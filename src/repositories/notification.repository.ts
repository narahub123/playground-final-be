import mongoose from "mongoose";
import { INotification, INotificationInput } from "@types";
import { mongoDBErrorHandler } from "@utils";
import { Notification } from "@models";

class NotificationRepository {
  async createNotification(
    notification: INotificationInput,
    options?: { session: mongoose.ClientSession }
  ): Promise<INotification | undefined> {
    try {
      const newNotification = await Notification.create(
        [notification],
        options
      );

      return newNotification[0] || undefined;
    } catch (error) {
      mongoDBErrorHandler("createNotification", error, { notification });
    }
  }
}

export default new NotificationRepository();
