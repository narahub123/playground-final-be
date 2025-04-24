import { NotFoundError } from "@errors";
import { displayRepository } from "@repositories";
import { IDisplay } from "@types";
import { Types } from "mongoose";

class DisplayService {
  async getDisplayByUserId(userId: Types.ObjectId): Promise<IDisplay> {
    const display = await displayRepository.getDisplayByUserId(userId);

    if (display === null) {
      throw new NotFoundError(
        "Display not found. (표시 설정 조회 실패)",
        "NOT_FOUND",
        {
          display: "DISPLAY_NOT_FOUND",
        }
      );
    }

    return display;
  }
}

export default new DisplayService();
