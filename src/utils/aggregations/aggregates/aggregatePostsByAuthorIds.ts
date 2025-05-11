import { Post } from "@models";
import { IPostResponseDto } from "@types";
import { ClientSession, Types } from "mongoose";
import { POSTS_LENGTH } from "@constants";

const aggregatePostsByAuthorIds = async (
  authorIds: Types.ObjectId[],
  pageNum: number,
  session?: ClientSession
) => {
  const posts = await Post.aggregate<IPostResponseDto>([
    // 조회
    {
      $match: {
        author: { $in: authorIds },
        isDeleted: false,
        $or: [
          { type: { $nin: ["repost", "quote"] } },
          { type: { $in: ["repost", "quote"] }, isOriginalPostDeleted: false },
        ],
      },
    },

    // reposts, comments 필터링
    {
      $facet: {
        comments: [
          { $match: { type: "comment" } }, // comment만 필터링
          { $sort: { createdAt: -1 } }, // 최신 댓글을 먼저 정렬
          {
            $lookup: {
              from: "posts",
              localField: "originalPostId",
              foreignField: "_id",
              as: "originalPost",
              pipeline: [{ $match: { type: "comment" } }], // 부모 포스트만 가져오기
            },
          },
          { $unwind: "$originalPost" }, // 부모 포스트 펼치기
          { $match: { $expr: { $ne: ["$_id", "$originalPost._id"] } } }, // 자기 자신을 부모 포스트로 참조한 댓글 제외
        ],
        reposts: [
          { $match: { type: "repost", isOriginalPostDeleted: false } }, // repost만 필터링
          { $sort: { repostedAt: 1 } }, // repostedAt 기준으로 정렬 (오래된 리포스트가 먼저 오도록)
          {
            $group: {
              _id: "$originalPostId", // originalPostId로 그룹화
              repost: { $first: "$$ROOT" }, // 첫 번째 리포스트만 남기기
            },
          },
          { $replaceRoot: { newRoot: "$repost" } }, // 첫 번째 리포스트만 반환
        ],
        others: [
          { $match: { type: { $nin: ["comment", "repost"] } } }, // comment와 repost가 아닌 다른 포스트는 그대로
        ],
      },
    },
    {
      $project: {
        allPosts: { $concatArrays: ["$comments", "$reposts", "$others"] }, // 댓글, 리포스트, 다른 포스트들을 합침
      },
    },
    {
      $unwind: { path: "$allPosts", preserveNullAndEmptyArrays: true }, // 배열을 풀어서 평평한 구조로
    },
    {
      $replaceRoot: { newRoot: "$allPosts" }, // 최종적으로 각 문서를 새로운 루트로 설정
    },

    // 페이지네이션
    { $sort: { createdAt: -1 } },
    {
      $skip: pageNum * POSTS_LENGTH,
    },
    {
      $limit: POSTS_LENGTH,
    },

    // 타입별 분기
    {
      $facet: {
        posts: [
          {
            $match: { type: "post" },
          },
          {
            $lookup: {
              from: "users", // 사용자 정보가 담긴 컬렉션 이름
              localField: "author", // 현재 포스트의 author 필드
              foreignField: "_id", // 'users' 컬렉션의 _id와 매칭
              as: "authorInfo", // 결과를 authorInfo 배열로 가져옵니다.
            },
          },
          {
            $project: {
              postData: {
                $mergeObjects: [
                  "$$ROOT",
                  { author: { $arrayElemAt: ["$authorInfo", 0] } },
                ],
              },
              originalPost: null,
              thread: [],
            },
          },
        ],
        reposts: [
          // 1. 'repost' 타입만 필터링
          {
            $match: { type: "repost" },
          },

          // 2. 'posts' 컬렉션에서 원본 포스트 조회
          // repost의 'originalPostId'와 'posts' 컬렉션의 '_id'를 매칭하여 원본 포스트를 가져옵니다.
          {
            $lookup: {
              from: "posts", // 원본 포스트를 가져올 컬렉션
              localField: "originalPostId", // repost의 'originalPostId' 필드
              foreignField: "_id", // 'posts' 컬렉션의 '_id'와 매칭
              as: "originalPost", // 원본 포스트 데이터를 'originalPost' 필드에 저장
            },
          },

          // 3. 'originalPost' 배열을 개별 문서로 풀어서 처리
          {
            $unwind: {
              path: "$originalPost", // 'originalPost' 배열을 풀어서 개별 문서로 만듬
              preserveNullAndEmptyArrays: true, // 'originalPost'가 없을 때도 null을 유지
            },
          },

          // 4. repost 데이터와 원본 포스트 데이터를 하나의 배열로 병합
          {
            $project: {
              postsArray: [
                "$$ROOT", // 현재 'repost' 데이터
                "$originalPost", // 'originalPost' 데이터
              ],
            },
          },

          // 5-1. postsArray의 각 요소를 개별 문서로 풀기
          { $unwind: "$postsArray" },

          // 5-2. 각 포스트에 author 정보 병합
          {
            $lookup: {
              from: "users",
              localField: "postsArray.author",
              foreignField: "_id",
              as: "authors",
            },
          },

          // 5-3. author 배열을 평탄화
          {
            $addFields: {
              "postsArray.author": { $arrayElemAt: ["$authors", 0] },
            },
          },

          // 5-4. 중간 결과를 다시 배열로 모음
          {
            $group: {
              _id: "$_id", // 문서 기준 ID (필요 시 다른 키)
              postsArrayWithAuthors: { $push: "$postsArray" },
            },
          },
          // 6. 'postsArrayWithAuthors'에서 'repost' 타입을 필터링하여 'postData'에 할당
          // 'post' 타입도 필터링하여 'originalPost'에 할당합니다.
          {
            $project: {
              postData: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$postsArrayWithAuthors", // 'postsArrayWithAuthors' 배열을 필터링
                      as: "item",
                      cond: { $eq: ["$$item.type", "repost"] }, // 'type'이 'repost'인 것만 필터링
                    },
                  },
                  0, // 첫 번째 요소만 가져옵니다
                ],
              },
              originalPost: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$postsArrayWithAuthors", // 'postsArrayWithAuthors' 배열을 필터링
                      as: "item",
                      cond: { $eq: ["$$item.type", "post"] }, // 'type'이 'post'인 것만 필터링
                    },
                  },
                  0, // 첫 번째 요소만 가져옵니다
                ],
              },
              thread: [], // 빈 배열로 설정 (댓글이나 대댓글 처리는 추후 추가)
            },
          },
        ],
        quotes: [
          // 1. 'repost' 타입만 필터링
          {
            $match: { type: "quote" },
          },

          // 2. 'posts' 컬렉션에서 원본 포스트 조회
          // repost의 'originalPostId'와 'posts' 컬렉션의 '_id'를 매칭하여 원본 포스트를 가져옵니다.
          {
            $lookup: {
              from: "posts", // 원본 포스트를 가져올 컬렉션
              localField: "originalPostId", // repost의 'originalPostId' 필드
              foreignField: "_id", // 'posts' 컬렉션의 '_id'와 매칭
              as: "originalPost", // 원본 포스트 데이터를 'originalPost' 필드에 저장
            },
          },

          // 3. 'originalPost' 배열을 개별 문서로 풀어서 처리
          {
            $unwind: {
              path: "$originalPost", // 'originalPost' 배열을 풀어서 개별 문서로 만듬
              preserveNullAndEmptyArrays: true, // 'originalPost'가 없을 때도 null을 유지
            },
          },

          // 4. repost 데이터와 원본 포스트 데이터를 하나의 배열로 병합
          {
            $project: {
              postsArray: [
                "$$ROOT", // 현재 'repost' 데이터
                "$originalPost", // 'originalPost' 데이터
              ],
            },
          },

          // 5-1. postsArray의 각 요소를 개별 문서로 풀기
          { $unwind: "$postsArray" },

          // 5-2. 각 포스트에 author 정보 병합
          {
            $lookup: {
              from: "users",
              localField: "postsArray.author",
              foreignField: "_id",
              as: "author",
            },
          },

          // 5-3. author 배열을 평탄화
          {
            $addFields: {
              "postsArray.author": { $arrayElemAt: ["$author", 0] },
            },
          },

          // 5-4. 중간 결과를 다시 배열로 모음
          {
            $group: {
              _id: "$_id", // 문서 기준 ID (필요 시 다른 키)
              postsArrayWithAuthors: { $push: "$postsArray" },
            },
          },
          // 6. 'postsArrayWithAuthors'에서 'repost' 타입을 필터링하여 'postData'에 할당
          // 'post' 타입도 필터링하여 'originalPost'에 할당합니다.
          {
            $project: {
              postData: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$postsArrayWithAuthors", // 'postsArrayWithAuthors' 배열을 필터링
                      as: "item",
                      cond: { $eq: ["$$item.type", "quote"] }, // 'type'이 'repost'인 것만 필터링
                    },
                  },
                  0, // 첫 번째 요소만 가져옵니다
                ],
              },
              originalPost: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$postsArrayWithAuthors", // 'postsArrayWithAuthors' 배열을 필터링
                      as: "item",
                      cond: { $eq: ["$$item.type", "post"] }, // 'type'이 'post'인 것만 필터링
                    },
                  },
                  0, // 첫 번째 요소만 가져옵니다
                ],
              },
              thread: [], // 빈 배열로 설정 (댓글이나 대댓글 처리는 추후 추가)
            },
          },
        ],
        comments: [
          // 1. 'comment' 타입만 필터링
          {
            $match: { type: "comment" },
          },

          // 2. $graphLookup를 사용하여 원본 포스트 기반으로 재귀적으로 댓글을 찾습니다.
          {
            $graphLookup: {
              from: "posts",
              startWith: "$originalPostId",
              connectFromField: "originalPostId",
              connectToField: "_id",
              as: "originalPosts",
              maxDepth: 10,
              depthField: "level",
            },
          },

          // originalPosts 중 isDeleted가 있는 경우 이후 데이터는 제외
          // 삭제된 글에 대한 댓글이 존재하는 경우 원 글의 사용자를 표시하기 위한 조치
          {
            $addFields: {
              originalPosts: {
                $let: {
                  vars: {
                    deletedFound: false, // 삭제된 포스트를 찾았는지 여부
                  },
                  in: {
                    $map: {
                      input: "$originalPosts",
                      as: "post",
                      in: {
                        $cond: [
                          {
                            // 삭제된 포스트가 아직 나오지 않은 경우
                            $eq: ["$$deletedFound", false],
                          },
                          {
                            // 삭제된 포스트를 발견하면 해당 포스트를 추가하고, 이후에는 포함하지 않음
                            $setField: {
                              input: "$$post",
                              field: "deletedFound",
                              value: true,
                            },
                          },
                          // 이후의 포스트들은 isDeleted가 true인 경우 제외
                          {
                            $cond: {
                              if: { $eq: ["$$post.isDeleted", true] },
                              then: null,
                              else: "$$post",
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },

          // 3. 'originalPosts' 배열을 풀어서 개별 문서로 만듭니다.
          {
            $unwind: {
              path: "$originalPosts",
              preserveNullAndEmptyArrays: true,
            },
          },

          // 4. 현재 댓글 데이터와 부모 댓글 데이터를 하나의 배열로 병합
          {
            $project: {
              postsArray: ["$$ROOT", "$originalPosts"],
            },
          },

          // 5. 'postsArray'에 사용자 정보 추가를 위해 $lookup을 사용해 사용자 정보를 조회합니다.
          // 5-1. postsArray의 각 요소를 개별 문서로 풀기
          { $unwind: "$postsArray" },

          // 5-2. 각 포스트에 author 정보 병합
          {
            $lookup: {
              from: "users",
              localField: "postsArray.author",
              foreignField: "_id",
              as: "authors",
            },
          },

          // 5-3. author 배열을 평탄화
          {
            $addFields: {
              "postsArray.author": { $arrayElemAt: ["$authors", 0] },
            },
          },

          // 5-4. 중간 결과를 다시 배열로 모음
          {
            $group: {
              _id: "$_id", // 문서 기준 ID (필요 시 다른 키)
              postsArrayWithAuthors: { $push: "$postsArray" },
            },
          },

          // 7. 'postsArrayWithAuthors'에서 'repost', 'quote', 'post'를 구분하여 처리
          {
            $project: {
              postData: {
                $let: {
                  vars: {
                    repostQuote: {
                      $filter: {
                        input: "$postsArrayWithAuthors",
                        as: "item",
                        cond: { $in: ["$$item.type", ["repost", "quote"]] },
                      },
                    },
                    original: {
                      $filter: {
                        input: "$postsArrayWithAuthors",
                        as: "item",
                        cond: { $eq: ["$$item.type", "post"] },
                      },
                    },
                  },
                  in: {
                    $cond: {
                      if: { $gt: [{ $size: "$$repostQuote" }, 0] },
                      then: { $first: "$$repostQuote" }, // repost나 quote 타입이 있으면 해당 타입을 postData로
                      else: {
                        $cond: {
                          if: { $gt: [{ $size: "$$original" }, 0] },
                          then: { $first: "$$original" }, // post 타입이 있으면 해당 타입을 postData로
                          else: null, // 둘 다 없으면 null
                        },
                      },
                    },
                  },
                },
              },
              originalPost: {
                $let: {
                  vars: {
                    repostQuote: {
                      $filter: {
                        input: "$postsArrayWithAuthors",
                        as: "item",
                        cond: { $in: ["$$item.type", ["repost", "quote"]] },
                      },
                    },
                    original: {
                      $filter: {
                        input: "$postsArrayWithAuthors",
                        as: "item",
                        cond: { $eq: ["$$item.type", "post"] },
                      },
                    },
                  },
                  in: {
                    $cond: {
                      if: { $gt: [{ $size: "$$repostQuote" }, 0] },
                      then: { $first: "$$original" }, // repost나 quote 타입이 있으면 post를 originalPost로
                      else: null, // 없으면 null
                    },
                  },
                },
              },
              thread: {
                $let: {
                  vars: {
                    comments: {
                      $filter: {
                        input: "$postsArrayWithAuthors",
                        as: "item",
                        cond: { $eq: ["$$item.type", "comment"] },
                      },
                    },
                  },
                  in: {
                    $reverseArray: "$$comments", // 댓글을 부모에서 자식 순서대로 역순으로 정렬
                  },
                },
              },
            },
          },
        ],
      },
    },

    // 병합
    {
      // 2. 모든 데이터를 하나의 배열로 합치기
      $project: {
        posts: {
          $concatArrays: ["$posts", "$reposts", "$quotes", "$comments"],
        },
      },
    },
    {
      // 3. 결과를 하나의 배열로 펼침
      $unwind: "$posts",
    },
    {
      // 4. 최종적으로 구조를 맞추기 위해 원래 포스트로 대체
      $replaceRoot: { newRoot: "$posts" },
    },

    // isRepostedByCurrentUser 추가: 중복 줄이기
    {
      $lookup: {
        from: "posts",
        let: { currentUser: authorIds[0] },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$type", "repost"] },
                  { $eq: ["$author", "$$currentUser"] },
                  { $eq: ["$isDeleted", false] },
                  { $eq: ["$isOriginalPostDeleted", false] },
                ],
              },
            },
          },
          {
            // originalPostId 기준으로 그룹화하여 중복 제거
            $group: {
              _id: "$originalPostId", // originalPostId로 그룹화
              reposts: { $first: "$$ROOT" }, // 같은 originalPostId를 가진 첫 번째 repost를 가져옵니다.
            },
          },
          {
            $replaceRoot: { newRoot: "$reposts" }, // _id를 제외하고 repost 정보를 root로 설정
          },
        ],
        as: "repostsByCurrentUser",
      },
    },
    {
      $addFields: {
        repostedOriginalPostIds: {
          $map: {
            input: "$repostsByCurrentUser",
            as: "rp",
            in: "$$rp.originalPostId",
          },
        },
      },
    },
    {
      $set: {
        postData: {
          $mergeObjects: [
            "$postData",
            {
              isRepostedByCurrentUser: {
                $in: ["$postData._id", "$repostedOriginalPostIds"], // 나중에 추가되는 배열과 비교
              },
            },
          ],
        },
      },
    },

    // 반환 형식
    {
      $project: {
        _id: "$postData._id",
        type: "$postData.type",
        author: {
          _id: "$postData.author._id",
          userId: "$postData.author.userId",
          username: "$postData.author.username",
          profileImage: "$postData.author.profileImage",
          intro: "$postData.author.intro",
          followings: "$postData.author.followings",
          followers: "$postData.author.followers",
        },
        text: "$postData.text",
        media: "$postData.media",
        vote: "$postData.vote",
        schedule: "$postData.schedule",
        actions: "$postData.actions",
        pin: "$postData.pin",
        createdAt: "$postData.createdAt",
        updatedAt: "$postData.updatedAt",
        originalPostId: "$postData.originalPostId",
        repostedPostId: "$postData.repostedPostId",
        isOriginalPostDeleted: "$postData.isOriginalPostDeleted",
        repostedAt: "$postData.repostedAt",
        isRepostedByCurrentUser: "$postData.isRepostedByCurrentUser",
        quotedAt: "$postData.quotedAt",
        commentedAt: "$postData.commentedAt",
        basePostId: "$postData._id",

        originalPost: {
          _id: "$originalPost._id",
          type: "$originalPost.type",
          author: {
            _id: "$originalPost.author._id",
            userId: "$originalPost.author.userId",
            username: "$originalPost.author.username",
            profileImage: "$originalPost.author.profileImage",
            intro: "$originalPost.author.intro",
            followings: "$originalPost.author.followings",
            followers: "$originalPost.author.followers",
          },
          text: "$originalPost.text",
          media: "$originalPost.media",
          schedule: "$originalPost.schedule",
          vote: "$originalPost.vote",
          actions: "$originalPost.actions",
          originalPost: "$originalPost.originalPost",
          originalPostId: "$originalPost.originalPostId",
          repostedPostId: "$originalPost.repostedPostId",
          isOriginalPostDeleted: "$originalPost.isOriginalPostDeleted",
          repostedAt: "$originalPost.repostedAt",
          quotedAt: "$originalPost.quotedAt",
          commentedAt: "$originalPost.commentedAt",
          createdAt: "$originalPost.createdAt",
          updatedAt: "$originalPost.updatedAt",
          pin: "$originalPost.pin",
          basePostId: "$postData._id",
        },
        thread: {
          $map: {
            input: "$thread",
            as: "entry",
            in: {
              _id: "$$entry._id",
              type: "$$entry.type",
              author: {
                _id: "$$entry.author._id",
                userId: "$$entry.author.userId",
                username: "$$entry.author.username",
                profileImage: "$$entry.author.profileImage",
                intro: "$$entry.author.intro",
                followings: "$$entry.author.followings",
                followers: "$$entry.author.followers",
              },
              text: "$$entry.text",
              media: "$$entry.media",
              schedule: "$$entry.schedule",
              vote: "$$entry.vote",
              actions: "$$entry.actions",
              originalPost: "$$entry.originalPost",
              originalPostId: "$$entry.originalPostId",
              isOriginalPostDeleted: "$$entry.isOriginalPostDeleted",
              repostedAt: "$$entry.repostedAt",
              quotedAt: "$$entry.quotedAt",
              entryedAt: "$$entry.commentedAt",
              createdAt: "$$entry.createdAt",
              updatedAt: "$$entry.updatedAt",
              pin: "$$entry.pin",
              basePostId: "$postData._id",
            },
          },
        },
        comments: {
          $map: {
            input: "$comments",
            as: "comment",
            in: {
              _id: "$$comment._id",
              type: "$$comment.type",
              author: {
                _id: "$$comment.author._id",
                userId: "$$comment.author.userId",
                username: "$$comment.author.username",
                profileImage: "$$comment.author.profileImage",
                intro: "$$comment.author.intro",
                followings: "$$comment.author.followings",
                followers: "$$comment.author.followers",
              },
              text: "$$comment.text",
              media: "$$comment.media",
              schedule: "$$comment.schedule",
              vote: "$$comment.vote",
              actions: "$$comment.actions",
              originalPost: "$$comment.originalPost",
              originalPostId: "$$comment.originalPostId",
              repostedAt: "$$comment.repostedAt",
              quotedAt: "$$comment.quotedAt",
              commentedAt: "$$comment.commentedAt",
              createdAt: "$$comment.createdAt",
              updatedAt: "$$comment.updatedAt",
              pin: "$$comment.pin",
              basePostId: "$postData._id",
            },
          },
        },
      },
    },
  ]);

  console.log(posts);

  return posts;
};

export default aggregatePostsByAuthorIds;
