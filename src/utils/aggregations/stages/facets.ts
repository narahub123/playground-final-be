import {
  AddFieldsStage,
  GroupStage,
  LookupStage,
  MatchStage,
  ProjectStage,
  ReplaceRootStage,
  SortStage,
  UnwindStage,
} from "@utils";

class FacetStage {
  static filterRepostsAndComments() {
    return {
      $facet: {
        comments: [MatchStage.matchByType("comment"), SortStage.createdAt(-1)],
        originalPostIds: [
          MatchStage.matchByType("comment"),
          SortStage.createdAt(-1),
          ProjectStage.commentOrignalPostIds(),
        ],
        reposts: [
          MatchStage.matchByType("repost"),
          SortStage.repostedAt(1),
          GroupStage.removeDuplicateOriginalPost(),
          ReplaceRootStage.replaceRoot("repost"),
        ],
        others: [MatchStage.excludeType(["comment", "repost"])],
      },
    };
  }

  static branchPostsByType() {
    return {
      $facet: {
        posts: [
          MatchStage.matchByType("post"),
          LookupStage.author("author", "authorInfo"),
          ProjectStage.posts(),
        ],
        reposts: [
          // 1. 'repost' 타입만 필터링
          MatchStage.matchByType("repost"),

          // 2. 'posts' 컬렉션에서 원본 포스트 조회
          // repost의 'originalPostId'와 'posts' 컬렉션의 '_id'를 매칭하여 원본 포스트를 가져옵니다.
          LookupStage.originalPosts("originalPostId"),

          // 3. 'originalPost' 배열을 개별 문서로 풀어서 처리
          UnwindStage.unwind("originalPosts"),

          // 4. repost 데이터와 원본 포스트 데이터를 하나의 배열로 병합
          ProjectStage.combineRootAndOriginalPosts(),

          // 5-1. postsArray의 각 요소를 개별 문서로 풀기
          UnwindStage.simple("postsArray"),

          // 5-2. 각 포스트에 author 정보 병합
          LookupStage.author("postsArray.author", "authors"),

          // 5-3. author 배열을 평탄화
          AddFieldsStage.flattenAuthorIntoPostsArray(),

          // 5-4. 중간 결과를 다시 배열로 모음
          GroupStage.createPostsArrayWithAuthors(),

          // 6. 'postsArrayWithAuthors'에서 'repost' 타입을 필터링하여 'postData'에 할당
          // 'post' 타입도 필터링하여 'originalPost'에 할당합니다.
          ProjectStage.reposts(),
        ],
        quotes: [
          // 1. 'repost' 타입만 필터링
          MatchStage.matchByType("quote"),

          // 2. 'posts' 컬렉션에서 원본 포스트 조회
          // repost의 'originalPostId'와 'posts' 컬렉션의 '_id'를 매칭하여 원본 포스트를 가져옵니다.
          LookupStage.originalPosts("originalPostId"),

          // 3. 'originalPost' 배열을 개별 문서로 풀어서 처리
          UnwindStage.unwind("originalPosts"),

          // 4. repost 데이터와 원본 포스트 데이터를 하나의 배열로 병합
          ProjectStage.combineRootAndOriginalPosts(),

          // 5-1. postsArray의 각 요소를 개별 문서로 풀기
          UnwindStage.simple("postsArray"),

          // 5-2. 각 포스트에 author 정보 병합
          LookupStage.author("postsArray.author", "authors"),

          // 5-3. author 배열을 평탄화
          AddFieldsStage.flattenAuthorIntoPostsArray(),

          // 5-4. 중간 결과를 다시 배열로 모음
          GroupStage.createPostsArrayWithAuthors(),

          // 6. 'postsArrayWithAuthors'에서 'repost' 타입을 필터링하여 'postData'에 할당
          // 'post' 타입도 필터링하여 'originalPost'에 할당합니다.
          ProjectStage.quotes(),
        ],
        comments: [
          // 1. 'comment' 타입만 필터링
          MatchStage.matchByType("comment"),

          // 2. $graphLookup를 사용하여 원본 포스트 기반으로 재귀적으로 댓글을 찾습니다.
          LookupStage.graphLookupOriginalPost("originalPosts"),

          // originalPosts 중 isDeleted가 있는 경우 이후 데이터는 제외
          // 삭제된 글에 대한 댓글이 존재하는 경우 원 글의 사용자를 표시하기 위한 조치
          AddFieldsStage.trimOriginalPostsOnFirstDeleted(),

          // 3. 'originalPosts' 배열을 풀어서 개별 문서로 만듭니다.
          UnwindStage.unwind("originalPosts"),

          // 4. 현재 댓글 데이터와 부모 댓글 데이터를 하나의 배열로 병합
          ProjectStage.combineRootAndOriginalPosts(),

          // 5. 'postsArray'에 사용자 정보 추가를 위해 $lookup을 사용해 사용자 정보를 조회합니다.
          // 5-1. postsArray의 각 요소를 개별 문서로 풀기
          UnwindStage.simple("postsArray"),

          // 5-2. 각 포스트에 author 정보 병합
          LookupStage.author("postsArray.author", "authors"),

          // 5-3. author 배열을 평탄화
          AddFieldsStage.flattenAuthorIntoPostsArray(),

          // 5-4. 중간 결과를 다시 배열로 모음
          GroupStage.createPostsArrayWithAuthors(),

          // 7. 'postsArrayWithAuthors'에서 'repost', 'quote', 'post'를 구분하여 처리
          ProjectStage.comments(),
        ],
      },
    };
  }
}

export default FacetStage;
