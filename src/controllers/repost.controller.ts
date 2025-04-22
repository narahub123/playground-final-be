import { BadRequestError, NotFoundError, UnauthorizedError } from "@errors";
import { asyncWrapper } from "@middlewares";
import { repostService } from "@services";
import { IApiSuccessResponse } from "@types";
import { Request, Response } from "express";
import mongoose from "mongoose";

const deleteRepost = asyncWrapper(
  "deleteRepost",
  "Deleting repost failed.(재게시 삭제 실패)",
  "DELETE_REPOST_FAILED",
  async (req: Request, res: Response) => {
    const { repostid } = req.params;
    const { _id: user } = req.user;

    if (!repostid) {
      throw new BadRequestError("repostId 필수");
    }

    const repostId = new mongoose.Types.ObjectId(repostid);

    const repost = await repostService.findRepostById(repostId);

    if (!repost) {
      throw new NotFoundError("재게시물을 찾을 수 없음");
    }

    if (!repost.user.equals(user)) {
      throw new UnauthorizedError("재게물 삭제 권한이 없습니다.");
    }

    await repostService.deleteRepost(repostId);

    const response: IApiSuccessResponse = {
      success: true,
      message: "Repost is deleted successfully.(재게시 삭제 성공)",
      code: "DELETE_REPOST_SUCCEEDED",
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  }
);

export { deleteRepost };
