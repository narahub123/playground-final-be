import { Post } from "@models";
import { IPostResponseDto } from "@types";
import { ClientSession, Types } from "mongoose";
import {
  AddFieldsStage,
  LimitStage,
  LookupStage,
  MatchStage,
  ProjectStage,
  SkipStage,
  SortStage,
} from "@utils";
import { POSTS_LENGTH } from "@constants";

const getMediaByCurrentUser = async (
  userId: Types.ObjectId,
  pageNum: number,
  session?: ClientSession
): Promise<IPostResponseDto[]> => {
  const posts = await Post.aggregate<IPostResponseDto>(
    [
      MatchStage.media(userId),

      LookupStage.author("author", "authors"),

      ProjectStage.media(),

      ProjectStage.fullPostStructure(),

      // 정렬
      AddFieldsStage.addThreadLastCommentedAt(),
      AddFieldsStage.addSortKey(),
      SortStage.sortKey(-1),

      // 페이지네이션
      SortStage.createdAt(-1),
      SkipStage.skipPage(pageNum, POSTS_LENGTH),
      LimitStage.basic(POSTS_LENGTH),
    ],
    { session }
  );

  return posts;
};

export default getMediaByCurrentUser;
