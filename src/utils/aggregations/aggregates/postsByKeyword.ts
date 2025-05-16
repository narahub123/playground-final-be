import { Post } from "@models";
import { IPostResponseDto } from "@types";
import { ClientSession } from "mongoose";
import { LookupStage, ProjectStage, UnwindStage } from "../stages";

const getPostsByKeyword = async (
  keyword: string,
  pageNum: number,
  session?: ClientSession
): Promise<IPostResponseDto[]> => {
  const posts = await Post.aggregate<IPostResponseDto>([
    {
      $match: {
        text: { $regex: keyword, $options: "i" },
        isDeleted: false,
      },
    },

    LookupStage.author("author", "authorInfo"),

    {
      $addFields: {
        author: { $arrayElemAt: ["$authorInfo", 0] },
      },
    },

    {
      $graphLookup: {
        from: "posts",
        startWith: "$originalPostId",
        connectFromField: "originalPostId",
        connectToField: "_id",
        as: "originalPosts",
        maxDepth: 1,
        depthField: "level",
      },
    },

    UnwindStage.unwind("originalPosts"),

    LookupStage.author("originalPosts.authors", "originalPostAuthor"),

    {
      $addFields: {
        "originalPosts.author": {
          $arrayElemAt: ["$originalPostAuthor", 0],
        },
      },
    },

    {
      $project: {
        postData: "$$ROOT", // 현재 포스트 전체
        originalPost: "$originalPosts",
        thread: [],
      },
    },

    ProjectStage.fullPostStructure(),
  ]);

  console.log("검색 결과", posts);

  return posts;
};

export default getPostsByKeyword;
