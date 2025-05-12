import { Post } from "@models";
import { IPostResponseDto } from "@types";
import { ClientSession, Types } from "mongoose";
import { POSTS_LENGTH } from "@constants";
import {
  AddFieldsStage,
  Extra,
  FacetStage,
  LimitStage,
  LookupStage,
  MatchStage,
  ProjectStage,
  ReplaceRootStage,
  SetStage,
  SkipStage,
  SortStage,
  UnwindStage,
} from "../stages";

const aggregatePostsByAuthorIds = async (
  authorIds: Types.ObjectId[],
  pageNum: number,
  session?: ClientSession
) => {
  const posts = await Post.aggregate<IPostResponseDto>(
    [
      // 조회
      MatchStage.authorIds(authorIds),

      // reposts, comments 필터링
      FacetStage.filterRepostsAndComments(),
      ProjectStage.combineFields("allPosts", [
        "$comments",
        "$reposts",
        "$others",
      ]),
      UnwindStage.unwind("allPosts"),
      ReplaceRootStage.replaceRoot("allPosts"),

      // 페이지네이션
      SortStage.createdAt(-1),
      SkipStage.skipPage(pageNum, POSTS_LENGTH),
      LimitStage.basic(POSTS_LENGTH),

      // 타입별 분기
      FacetStage.branchPostsByType(),

      // 병합
      ProjectStage.combineFields("posts", [
        "$posts",
        "$reposts",
        "$quotes",
        "$comments",
      ]),
      UnwindStage.simple("posts"),
      ReplaceRootStage.replaceRoot("posts"),

      // isRepostedByCurrentUser 추가: 중복 줄이기
      LookupStage.repostsByCurrentUser(authorIds[0]!),
      AddFieldsStage.repostsByCurrentUser(),
      SetStage.mergeIsRepostedByCurrentUser(),

      // 반환 형식
      ProjectStage.fullPostStructure(),
    ],
    Extra.addSession(session)
  );

  console.log(posts);

  return posts;
};

export default aggregatePostsByAuthorIds;
