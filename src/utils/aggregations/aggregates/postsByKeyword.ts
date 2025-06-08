import { Post } from "@models";
import { IPostResponseDto } from "@types";
import { ClientSession } from "mongoose";
import {
  accountsConditions,
  AddFieldsStage,
  Extra,
  LimitStage,
  LookupStage,
  MatchStage,
  parseSearchKeyword,
  ProjectStage,
  SkipStage,
  SortStage,
  UnwindStage,
} from "@utils";
import { POSTS_LENGTH } from "@constants";

const getPostsByKeyword = async (
  keyword: string,
  pageNum: number,
  filter?: string,
  session?: ClientSession
): Promise<IPostResponseDto[]> => {
  const { accounts } = parseSearchKeyword(keyword);

  const pipelines: any[] = [
    LookupStage.author("author", "authorInfo"),

    AddFieldsStage.author("author", "authorInfo"),

    LookupStage.graphLookupOriginalPost("originalPosts", 1),

    UnwindStage.unwind("originalPosts"),

    LookupStage.author("originalPosts.author", "originalPostAuthor"),

    AddFieldsStage.author("originalPosts.author", "originalPostAuthor"),

    ProjectStage.keyword(),

    ProjectStage.fullPostStructure(),
  ];

  // filter가 user인 경우 user에서 검색
  if (filter === "user") {
    pipelines.unshift(
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorData",
        },
      },
      { $unwind: "$authorData" },
      { $match: { "authorData.username": { $regex: keyword, $options: "i" } } }
    );
  } else {
    // filter가 아닌 경우 post의 text에서 검색
    pipelines.unshift(
      MatchStage.search(keyword, filter),

      // accounts 필터링
      ...accountsConditions(accounts)
    );
  }

  // filter가 없으면 인기순(조회수의 역순)
  if (!filter) {
    pipelines.push(SortStage.views(-1));
  } else {
    // live인 경우 만들어진 순
    pipelines.push(
      AddFieldsStage.addThreadLastCommentedAt(),
      AddFieldsStage.addSortKey(),
      SortStage.sortKey(-1)
    );
  }

  // 페이지네이션
  pipelines.push(
    SkipStage.skipPage(pageNum, POSTS_LENGTH),
    LimitStage.basic(POSTS_LENGTH)
  );

  const posts = await Post.aggregate<IPostResponseDto>(
    pipelines,
    Extra.addSession(session)
  );

  console.log("검색 결과", posts);

  return posts;
};

export default getPostsByKeyword;
