import { Request, Response } from "express";
import { asyncWrapper } from "@middlewares";
import mongoose from "mongoose";
import { deleteMedia, modifyVote, uploadMedia } from "@utils";
import { IApiSuccessResponse, IPost, IVote, IPostRequestDto } from "@types";
import { postService } from "@services";

const creatNewPost = asyncWrapper(
  "creatNewPost",
  "Post creation failed. (포스트 생성 실패)",
  "POST_CREATION_FAILED",
  async (req: Request, res: Response) => {
    const user = req.user;
    const { text, media, vote, schedule } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    // 미디어 처리하기
    const newMedia = await uploadMedia(media);

    const newVote: IVote | undefined = modifyVote(vote);
    try {
      // 투표 처리하기

      const newPost: IPostRequestDto = {
        author: user._id,
        text,
        media:
          newMedia.length === 0 ? undefined : newMedia.map((m) => m.secure_url),
        schedule,
        vote: newVote,
      };

      // 이 부분 나중에 변경해야 할지도 모름
      const post = await postService.createPost(newPost, session);

      await session.commitTransaction();

      const response: IApiSuccessResponse<{ post: IPost }> = {
        success: true,
        message: "Post is created successfully. (포스트 생성 성공)",
        code: "POST_CREATION_SUCCEEDED",
        data: { post },
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      if (newMedia.length > 0) {
        deleteMedia(newMedia);
      }
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
);

export { creatNewPost };
