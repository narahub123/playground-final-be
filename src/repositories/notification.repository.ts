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

  async getNotificationByUserId(userId: string): Promise<INotification | null> {
    try {
      const notification = await Notification.findOne({ userId });

      return notification;
    } catch (error) {
      mongoDBErrorHandler("getNotificationByUserId", error, { userId });
      return null;
    }
  }
}

export default new NotificationRepository();
