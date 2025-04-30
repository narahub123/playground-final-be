import { Post } from "@models";
import { IPostResponseDto } from "@types";
import { ClientSession } from "mongoose";
import { Types } from "mongoose";
import {
  addSession,
  fetchCommentsFromActionsWithSkip,
  lookupCommentAuthors,
  matchPostById,
  mergeCommentAuthors,
  replaceRootWithComments,
  unwindComments,
} from "./aggregatePipelines";
import { COMMENT_LENGTH } from "@constants";

const aggregateCommentsByPostId = async (
  postId: Types.ObjectId,
  skip: number,
  session?: ClientSession
): Promise<IPostResponseDto[]> => {
  const comments = await Post.aggregate<IPostResponseDto>(
    [
      // postId로 post 가져오기
      matchPostById(postId),

      fetchCommentsFromActionsWithSkip(skip),

      lookupCommentAuthors(),

      mergeCommentAuthors(),

      unwindComments(),

      replaceRootWithComments(),
    ],
    addSession(session)
  );

  return comments;
};

export default aggregateCommentsByPostId;
