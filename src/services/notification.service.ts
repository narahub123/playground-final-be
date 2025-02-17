import { NotFoundError } from "@errors";
import { notificationRepository } from "@repositories";
import { INotification } from "@types";

class NotificationService {
  async getNotificationByUserId(userId: string): Promise<INotification> {
    const notification = await notificationRepository.getNotificationByUserId(
      userId
    );

    if (notification === null) {
      throw new NotFoundError(
        "Notification not found. (알림 설정 조회 실패)",
        "NOT_FOUND",
        {
          notification: "NOTIFICATION_NOT_FOUND",
        }
      );
    }

    return notification;
  }
}

export default new NotificationService();
