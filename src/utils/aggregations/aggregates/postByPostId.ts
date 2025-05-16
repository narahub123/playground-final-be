import { Post } from "@models";
import { ClientSession, Types } from "mongoose";
import {
  AddFieldsStage,
  Extra,
  GroupStage,
  LookupStage,
  MatchStage,
  ProjectStage,
  ReplaceRootStage,
  SortStage,
  UnwindStage,
} from "../stages";
import { IPostResponseDto } from "@types";

const getPostByPostId = async (
  postId: Types.ObjectId,
  session?: ClientSession
): Promise<IPostResponseDto | undefined> => {
  const posts = await Post.aggregate<IPostResponseDto>(
    [
      MatchStage.postId(postId),

      LookupStage.graphLookupOriginalPost("originalPosts", 10),

      ProjectStage.flattenRootAndOriginalPosts(),

      UnwindStage.simple("postsArray"),

      LookupStage.author("postsArray.author", "authors"),

      AddFieldsStage.flattenAuthorIntoPostsArray(),

      GroupStage.createPostsArrayWithAuthors(),

      AddFieldsStage.distributePosts(),

      // 댓글 반환하기
      LookupStage.commentsByPostId(),

      // 댓글 작성자 정보 가져오기
      LookupStage.author("comments.author", "commentAuthors"),

      // 댓글에 작성자 정보 추가하기
      AddFieldsStage.addAuthorToComment(),

      // 반환 형식
      ProjectStage.fullPostStructure(),
    ],
    Extra.addSession(session)
  );

  if (!posts) return undefined;

  console.log(posts[0]);

  return posts[0];
};

export default getPostByPostId;
