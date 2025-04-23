import { Request, Response } from "express";
import { asyncWrapper } from "@middlewares";
import mongoose, { mongo } from "mongoose";
import { deleteMedia, modifyVote, uploadMedia } from "@utils";
import {
  IApiSuccessResponse,
  IPost,
  IVote,
  IPostRequestDto,
  IPostResponseDto,
  IRepostRequestDto,
} from "@types";
import { postService, repostService, userService } from "@services";
import { JSDOM } from "jsdom";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "@errors";

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

const getPostPreview = asyncWrapper(
  "getLinkPreview",
  "Getting post preview failed(포스트 미리보기 실패)",
  "POST_PREVIEW_FAILED",
  async (req: Request, res: Response) => {
    const { url } = req.query;

    let link = url as string;

    if (!/^https?:\/\//.test(link)) {
      link = "https://" + link;
    }

    const resp = await fetch(link);
    const html = await resp.text();

    const dom = new JSDOM(html);

    const doc = dom.window.document;

    const image =
      doc.querySelector('meta[property="og:image"]')?.getAttribute("content") ||
      "";
    const desc =
      doc
        .querySelector('meta[property="og:description"]')
        ?.getAttribute("content") || "";
    const title =
      doc.querySelector('meta[property="og:title"]')?.getAttribute("content") ||
      "";
    const address =
      doc.querySelector('meta[property="og:url"]')?.getAttribute("content") ||
      "";

    const response: IApiSuccessResponse<{
      image: string;
      desc: string;
      title: string;
      url: string;
    }> = {
      success: true,
      message:
        "Getting link preview has succeeded.(링크 미리보기 가져오기 성공)",
      code: "POST_PREVIEW_SUCCEEDED",
      data: { image, desc, title, url: address },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  }
);

const updatePostVote = asyncWrapper(
  "updatePostVote",
  "",
  "",
  async (req: Request, res: Response) => {
    const { _id: user } = req.user;
    const { postId, optionIndex } = req.params;

    const post_id = new mongoose.Types.ObjectId(postId);
    const user_id = new mongoose.Types.ObjectId(user);
    const index = Number(optionIndex);

    const post = await postService.getPostById(post_id);

    // 포스트가 존재하지 않는 경우
    if (!post) {
      throw new NotFoundError(
        "Not found the post. (포스트 검색 실패)",
        "NOT_FOUND",
        { post: "POST_NOT_FOUND" }
      );
    } else if (!post.vote) {
      // 포스트에 투표가 존재하지 않는 경우
      throw new BadRequestError("진행 중인 투표가 없습니다.");
    } else if (post.vote.options.length - 1 < Number(optionIndex)) {
      // 옵션 인덱스가 실제 옵션 개수보다 큰 경우
      throw new BadRequestError("유효하지 않은 옵션");
    } else if (
      post.vote.options.some((option) => option.voters.includes(user))
    ) {
      // 이미 투표를 한 경우
      throw new ConflictError("중복 투표");
    }

    // 업데이트
    const result = await postService.updatePostVoteWithUserId(
      post_id,
      user_id,
      index
    );

    if (result) {
      const posts = await postService.getPostsByAuthor(user_id);

      const response = {
        success: true,
        message: "Voting is done successfully. (투표 성공)",
        code: "VOTING_SUCCEEDED",
        timestamp: new Date().toISOString(),
        data: {
          posts,
        },
      };

      res.status(200).json(response);
    }
  }
);

const addRepost = asyncWrapper(
  "addRepost",
  "Adding repost failed (재게시 실패)",
  "ADD_REPOST_FAILED",
  async (req: Request, res: Response) => {
    const { postid } = req.params;
    const user = req.user;

    if (!postid) {
      throw new BadRequestError("postid 필수");
    }

    const postId = new mongoose.Types.ObjectId(postid);

    const repost: IRepostRequestDto = {
      type: "repost",
      author: user._id,
      originalPostId: postId,
    };

    const newPost = await postService.createRepost(repost);

    if (!newPost) {
      throw new InternalServerError("재게시 도중 에러 발생");
    }

    const response: IApiSuccessResponse<{
      post: IPostResponseDto;
    }> = {
      success: true,
      message: "Adding repost has succeeded.(재게시 성공)",
      code: "ADD_REPOST_SUCCEEDED",
      data: { post: newPost },
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  }
);

const updateLikes = asyncWrapper(
  "updateLikes",
  "Updating likes failed. (좋아요 업데이트 실패)",
  "UPDATE_LIKES_FAILED",
  async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { _id: user } = req.user;

    if (!postId) {
      throw new BadRequestError("포스트 아이디 없음");
    }

    const postid = new mongoose.Types.ObjectId(postId);

    // 포스트에서 좋아요 추가 혹은 삭제
    const postLike = await postService.updateLikes(postid, user);

    // 유저에서 좋아요 추가 혹은 삭제
    const userLike = await userService.updateLikes(user, postid);

    if (postLike !== userLike) {
      throw new InternalServerError(
        "포스트와 유저의 좋아요 상태가 일치하지 않습니다.",
        "LIKES_STATE_MISMATCH",
        {
          postLike,
          userLike,
          postId,
          userId: user,
        }
      );
    }

    // 포스트 좋아요 추가 혹은 삭제와 유저의 좋아요 추가 혹은 삭제가 일치하는 경우
    const response: IApiSuccessResponse<{
      likes: boolean;
    }> = {
      success: true,
      message:
        "ㅣikes of Post and user updated successfully.(좋아요 업데이트 성공)",
      code: "UPDATE_LIKES_SUCCEEDED",
      data: { likes: postLike },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  }
);

const deletePost = asyncWrapper(
  "deletePost",
  "Deleting post failed.(포스트 삭제 실패)",
  "DELETE_POST_FAILED",
  async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { _id: user_id } = req.user;

    const postid = new mongoose.Types.ObjectId(postId);

    const post = await postService.getPostById(postid);

    if (!post) {
      throw new BadRequestError("포스트 조회 실패");
    }

    const { author } = post;

    // 사용자가 작성한 포스트가 아닌 경우
    if (!author._id.equals(user_id)) {
      throw new UnauthorizedError("삭제할 권한이 없습니다.");
    }

    await postService.deletePost(postid, user_id);

    const response: IApiSuccessResponse = {
      success: true,
      message: "Post is deleted successfully.(포스트 삭제 성공)",
      code: "DELETE_POST_SUCCEEDED",
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  }
);

const updatePin = asyncWrapper(
  "updatePin",
  "Updating pin failed. (포스트 핀 업데이트 실패)",
  "UPDATE_PIN_FAILED",
  async (req: Request, res: Response) => {
    const { postid } = req.params;
    const user = req.user;

    if (!postid) {
      throw new BadRequestError("postid 필요");
    }

    const postId = new mongoose.Types.ObjectId(postid);

    const post = await postService.getPostById(postId);

    if (!post) {
      throw new NotFoundError("포스트를 찾을 수 없음");
    }

    const user_id = post.author._id;

    // 사용자 _id와 작성자 _id가 일치하지 않는 경우
    if (!user._id.equals(user_id)) {
      throw new UnauthorizedError("권한 없음");
    }

    await postService.updatePin(postId);

    const response: IApiSuccessResponse = {
      success: true,
      message: "Pin updated successfully.(포스트 핀 업데이트 성공)",
      code: "UPDATE_PIN_SUCCEEDED",
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  }
);

export {
  creatNewPost,
  getPostPreview,
  updatePostVote,
  addRepost,
  updateLikes,
  deletePost,
  updatePin,
};
