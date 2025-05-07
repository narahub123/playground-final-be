import { ClientSession, Types } from "mongoose";
import { Post } from "@models";
import {
  addPostData,
  addSortedOriginalPosts,
  fetchCommentsFromActions,
  graphLookupOriginalPosts,
  groupOriginalPosts,
  lookupCommentAuthors,
  lookupOriginalPostAuthor,
  mapAuthorInfoToOriginalPosts,
  matchPostById,
  mergeCommentAuthors,
  projectFinalFields,
  unwindOriginalPosts,
  lookupCommentsByPostId,
  addSession,
} from "@utils";
import { IPostResponseDto } from "@types";

const aggregatePostById = async (
  postId: Types.ObjectId,
  session?: ClientSession
): Promise<IPostResponseDto | undefined> => {
  const posts = await Post.aggregate<IPostResponseDto>(
    [
      // 1. 주어진 _id에 해당하는 포스트를 필터링
      matchPostById(postId),

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

      // 10. orignalPostId가 postId와 일치하는 것을 가져옴
      lookupCommentsByPostId(),

      // 12. 댓글의 작성자 정보를 users 컬렉션에서 조회
      lookupCommentAuthors(),

      // 13. 댓글에 작성자 정보를 추가
      mergeCommentAuthors(),

      // 14. 최종 결과 필드 설정
      projectFinalFields(),
    ],
    addSession(session)
  );

  console.log(posts[0]);

  return posts[0];
};

export default aggregatePostById;
