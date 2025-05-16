import { Post } from "@models";
import { IPostResponseDto } from "@types";
import { ClientSession } from "mongoose";
import {
  AddFieldsStage,
  Extra,
  LimitStage,
  LookupStage,
  MatchStage,
  ProjectStage,
  SkipStage,
  SortStage,
  UnwindStage,
} from "@utils";
import { POSTS_LENGTH } from "@constants";

const getPostsByKeyword = async (
  keyword: string,
  pageNum: number,
  session?: ClientSession
): Promise<IPostResponseDto[]> => {
  const posts = await Post.aggregate<IPostResponseDto>(
    [
      MatchStage.search(keyword),

      LookupStage.author("author", "authorInfo"),

      AddFieldsStage.author("author", "authorInfo"),

      LookupStage.graphLookupOriginalPost("originalPosts", 1),

      UnwindStage.unwind("originalPosts"),

      LookupStage.author("originalPosts.authors", "originalPostAuthor"),

      AddFieldsStage.author("originalPosts.author", "originalPostAuthor"),

      ProjectStage.keyword(),

      ProjectStage.fullPostStructure(),

      // 정렬
      AddFieldsStage.addThreadLastCommentedAt(),
      AddFieldsStage.addSortKey(),
      SortStage.sortKey(-1),

      // 페이지네이션
      SkipStage.skipPage(pageNum, POSTS_LENGTH),
      LimitStage.basic(POSTS_LENGTH),
    ],
    Extra.addSession(session)
  );

  console.log("검색 결과", posts);

  return posts;
};

export default getPostsByKeyword;
