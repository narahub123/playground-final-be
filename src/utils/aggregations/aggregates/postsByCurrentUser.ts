import { Post } from "@models";
import { IPostResponseDto } from "@types";
import { ClientSession, Types } from "mongoose";
import {
  AddFieldsStage,
  Extra,
  FacetStage,
  LimitStage,
  LookupStage,
  MatchStage,
  ProjectStage,
  ReplaceRootStage,
  SkipStage,
  SortStage,
  UnwindStage,
} from "@utils";
import { POSTS_LENGTH } from "@constants";

const aggregatePostsByCurrentUser = async (
  authorIds: Types.ObjectId[],
  pageNum: number,
  session?: ClientSession
): Promise<IPostResponseDto[]> => {
  const posts = await Post.aggregate<IPostResponseDto>(
    [
      // 조회
      MatchStage.authorIds(authorIds),

      // comments 필터링
      {
        $facet: {
          comments: [
            MatchStage.matchByType("comment"),
            LookupStage.graphLookupOriginalPost("originalPosts"),
            // originalPost 중 현재 사용자가 아닌 글이 있으면 제거
            {
              $match: {
                $expr: {
                  $not: {
                    $anyElementTrue: {
                      $map: {
                        input: "$originalPosts",
                        as: "post",
                        in: { $ne: ["$$post.author", authorIds[0]!] },
                      },
                    },
                  },
                },
              },
            },
          ],
          originalPostIds: [
            MatchStage.matchByType("comment"),
            SortStage.createdAt(-1),
            ProjectStage.commentOrignalPostIds(),
          ],
          others: [MatchStage.excludeType(["comment"])],
        },
      },
      // 중복된 댓글 제거
      ProjectStage.filterComments(),
      ProjectStage.combineFields("allPosts", ["$comments", "$others"]),
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

      // 반환 형식
      ProjectStage.fullPostStructure(),

      // 정렬
      AddFieldsStage.addThreadLastCommentedAt(),
      AddFieldsStage.addSortKey(),
      SortStage.sortKey(-1),
    ],
    Extra.addSession(session)
  );

  console.log("현재 사용자의 포스트", posts);

  return posts;
};

export default aggregatePostsByCurrentUser;
