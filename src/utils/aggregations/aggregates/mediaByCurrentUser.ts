import { Post } from "@models";
import { IPostResponseDto } from "@types";
import { ClientSession, Types } from "mongoose";
import {
  AddFieldsStage,
  LookupStage,
  MatchStage,
  ProjectStage,
  SortStage,
} from "@utils";

const getMediaByCurrentUser = async (
  userId: Types.ObjectId,
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
    ],
    { session }
  );

  return posts;
};

export default getMediaByCurrentUser;
