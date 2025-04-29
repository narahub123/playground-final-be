import { Types } from "mongoose";
import {
  addPostData,
  addSortedOriginalPosts,
  graphLookupOriginalPosts,
  groupOriginalPosts,
  lookupOriginalPostAuthor,
  mapAuthorInfoToOriginalPosts,
  matchPostsByUserId,
  projectFinalFields,
  sortPostsByCreatedAtDesc,
  unwindOriginalPosts,
} from "@utils";
import { Post } from "@models";
import { IPostResponseDto } from "@types";

const aggregatePostsByUserId = async (
  userId: Types.ObjectId
): Promise<IPostResponseDto[]> => {
  const posts = await Post.aggregate<IPostResponseDto>([
    // 1. 주어진 userId에 해당하는 포스트를 필터링
    matchPostsByUserId(userId),

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

    // 14. 최종 결과 필드 설정
    projectFinalFields(),

    // 15. createdAt을 기준으로 역순으로 정렬
    sortPostsByCreatedAtDesc(),
  ]);

  return posts;
};

export default aggregatePostsByUserId;
