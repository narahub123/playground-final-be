import { Post } from "@models";
import { IPostResponseDto } from "@types";
import { ClientSession, Types } from "mongoose";
import {
  matchPostsByUserAndFollowings,
  addPostData,
  addSortedOriginalPosts,
  addThreadLastCommentedAt,
  graphLookupOriginalPosts,
  groupOriginalPosts,
  lookupOriginalPostAuthor,
  mapAuthorInfoToOriginalPosts,
  projectFinalFields,
  addSortKey,
  sortBySortKeyDesc,
  unwindOriginalPosts,
  matchReposts,
  replaceRootWithFirstRepost,
  addSession,
  addIsRepostedByCurrentUser,
  addRepostedOriginalPostIds,
  lookupRepostsByCurrentUser,
} from "./aggregatePipelines";

const aggregatePostsByUserAndFollowings = async (
  userIds: Types.ObjectId[],
  session?: ClientSession
): Promise<IPostResponseDto[]> => {
  const posts = await Post.aggregate<IPostResponseDto>(
    [
      matchPostsByUserAndFollowings(userIds),

      // 2. 원본 포스트를 재귀적으로 조회하여 원본 포스트들 배열을 생성
      graphLookupOriginalPosts(),

      // 3. 원본 포스트들을 depth 순으로 정렬하고, 현재 포스트를 originalPosts 배열 앞이나 뒤에 추가
      addSortedOriginalPosts(),

      // 4. originalPosts 배열을 펼쳐서 각 원본 포스트를 개별 문서로 변환
      unwindOriginalPosts(),

      // 5. 각 원본 포스트의 작성자 정보를 users 컬렉션에서 조회
      lookupOriginalPostAuthor(),

      // 6. 각 원본 포스트에 작성자 정보를 추가
      mapAuthorInfoToOriginalPosts(),

      // 7. 다시 원본 포스트들을 배열로 그룹화
      groupOriginalPosts(),

      // 8. postData, originalPost, comments를 나누어 각 필드에 할당
      addPostData(),

      lookupRepostsByCurrentUser(userIds[0]!),

      addRepostedOriginalPostIds(),

      addIsRepostedByCurrentUser(),

      matchReposts(),

      replaceRootWithFirstRepost(),

      // 14. 최종 결과 필드 설정
      projectFinalFields(),

      addThreadLastCommentedAt(),

      // 15. createdAt을 기준으로 역순으로 정렬
      addSortKey(),

      sortBySortKeyDesc(),
    ],
    addSession(session)
  );

  console.log("나와 팔로잉의 포스트 목록", posts);

  return posts;
};

export default aggregatePostsByUserAndFollowings;
