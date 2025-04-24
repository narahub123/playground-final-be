import { asyncWrapper } from "@middlewares";
import { privacyService } from "@services";
import { IApiSuccessResponse, IPrivacyDto } from "@types";
import { Request, Response } from "express";

class PrivacyController {
  updateMyPrivacy = asyncWrapper(
    "updateMyPrivacy",
    "Failed to update privacy. (개인 정보 업데이트 실패)",
    "PRIVACY_UPDATE_FAILED",
    async (req: Request, res: Response) => {
      const user = req.user;
      const body: IPrivacyDto = req.body;

      await privacyService.updateMyPrivacy(user._id, body);

      const response: IApiSuccessResponse = {
        success: true,
        message:
          "Privacy has been updated successfully. (개인 정보 업데이트 성공)",
        code: "PRIVACY_UPDATE_SUCCEEDED",
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    }
  );
}

export default new PrivacyController();
