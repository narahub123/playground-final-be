import { COMMENT_LENGTH } from "@constants";
import { ClientSession, Types } from "mongoose";

// 1. 주어진 _id에 해당하는 포스트를 필터링
const matchPostById = (_id: Types.ObjectId) => {
  return { $match: { _id } };
};

// 1. 주어진 userId에 해당하는 포스트를 필터링
const matchPostsByUserId = (userId: Types.ObjectId) => {
  return {
    $match: {
      author: userId,
      isDeleted: false,
    },
  };
};

const matchPostsByUserAndFollowings = (userIds: Types.ObjectId[]) => {
  return {
    $match: {
      author: { $in: userIds },
      isDeleted: false,
    },
  };
};

// 2. 원본 포스트를 재귀적으로 조회하여 원본 포스트들 배열을 생성
const graphLookupOriginalPosts = () => {
  return {
    $graphLookup: {
      from: "posts",
      startWith: "$originalPostId",
      connectFromField: "originalPostId",
      connectToField: "_id",
      as: "originalPosts",
      maxDepth: 10,
      depthField: "depth",
      restrictSearchWithMatch: {
        isDeleted: false, // 여기서 삭제된 포스트는 탐색을 중단
      },
    },
  };
};

// 3. 원본 포스트들을 depth 순으로 정렬하고, 현재 포스트를 originalPosts 배열 앞이나 뒤에 추가
const addSortedOriginalPosts = () => {
  return {
    $addFields: {
      originalPosts: {
        $let: {
          vars: {
            sortedPosts: {
              $sortArray: {
                input: "$originalPosts",
                sortBy: { depth: -1 }, // 깊이 순으로 내림차순 정렬
              },
            },
          },
          in: {
            $cond: {
              if: { $eq: ["$type", "post"] }, // 현재 포스트 타입이 'post'일 경우
              then: { $concatArrays: [["$$ROOT"], "$$sortedPosts"] }, // 현재 포스트를 맨 앞에 추가
              else: { $concatArrays: ["$$sortedPosts", ["$$ROOT"]] }, // 아니면 뒤에 추가
            },
          },
        },
      },
      rootPost: "$$ROOT", // 현재 포스트 데이터를 rootPost 필드에 저장
    },
  };
};

// 4. originalPosts 배열을 펼쳐서 각 원본 포스트를 개별 문서로 변환
const unwindOriginalPosts = () => {
  return {
    $unwind: { path: "$originalPosts", preserveNullAndEmptyArrays: true },
  };
};

// 5. 각 원본 포스트의 작성자 정보를 users 컬렉션에서 조회
const lookupOriginalPostAuthor = () => {
  return {
    $lookup: {
      from: "users",
      localField: "originalPosts.author",
      foreignField: "_id",
      as: "authorInfo",
    },
  };
};

// 6. 각 원본 포스트에 작성자 정보를 추가
const mapAuthorInfoToOriginalPosts = () => {
  return {
    $addFields: {
      "originalPosts.author": {
        $arrayElemAt: ["$authorInfo", 0], // 첫 번째 작성자 정보를 매핑
      },
    },
  };
};

// 7. 다시 원본 포스트들을 배열로 그룹화
const groupOriginalPosts = () => {
  return {
    $group: {
      _id: "$_id",
      rootPost: { $first: "$rootPost" },
      originalPosts: { $push: "$originalPosts" },
    },
  };
};

// 8. postData, originalPost, comments를 나누어 각 필드에 할당
const addPostData = () => {
  return {
    $addFields: {
      postData: {
        $let: {
          vars: {
            repostQuote: {
              $filter: {
                input: "$originalPosts",
                as: "op",
                cond: { $in: ["$$op.type", ["repost", "quote"]] },
              },
            },
            original: {
              $filter: {
                input: "$originalPosts",
                as: "op",
                cond: { $eq: ["$$op.type", "post"] },
              },
            },
          },
          in: {
            $cond: {
              if: { $gt: [{ $size: "$$repostQuote" }, 0] },
              then: { $first: "$$repostQuote" },
              else: {
                $cond: {
                  if: { $gt: [{ $size: "$$original" }, 0] },
                  then: { $first: "$$original" },
                  else: null,
                },
              },
            },
          },
        },
      },
      originalPost: {
        $let: {
          vars: {
            original: {
              $filter: {
                input: "$originalPosts",
                as: "op",
                cond: { $eq: ["$$op.type", "post"] },
              },
            },
          },
          in: {
            $cond: {
              if: { $gt: [{ $size: "$$original" }, 0] },
              then: { $first: "$$original" },
              else: null,
            },
          },
        },
      },
      thread: {
        $filter: {
          input: "$originalPosts",
          as: "op",
          cond: { $eq: ["$$op.type", "comment"] },
        },
      },
    },
  };
};

// 10. actions.comments에서 해당 포스트의 댓글 가져오기
const fetchCommentsFromActions = () => {
  return {
    $lookup: {
      from: "posts",
      let: { commentIds: "$rootPost.actions.comments" },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ["$_id", "$$commentIds"],
            },
          },
        },
        {
          $limit: COMMENT_LENGTH,
        },
      ],
      as: "comments",
    },
  };
};

const fetchCommentsFromActionsWithSkip = (skip: number) => {
  return {
    $lookup: {
      from: "posts",
      let: { commentIds: "$actions.comments" },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ["$_id", "$$commentIds"],
            },
          },
        },
        {
          $skip: COMMENT_LENGTH * skip,
        },
        {
          $limit: COMMENT_LENGTH,
        },
      ],
      as: "comments",
    },
  };
};

const unwindComments = () => {
  return {
    $unwind: "$comments",
  };
};

const replaceRootWithComments = () => {
  return { $replaceRoot: { newRoot: "$comments" } };
};

const lookupCommentsByPostId = () => {
  return {
    $lookup: {
      from: "posts",
      let: { postId: "$rootPost._id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$originalPostId", "$$postId"] },
                { $eq: ["$type", "comment"] },
                { $eq: ["$isDeleted", false] }, // 삭제된 댓글 제외
              ],
            },
          },
        },
        {
          $limit: COMMENT_LENGTH,
        },
      ],
      as: "comments",
    },
  };
};

// 12. 댓글의 작성자 정보를 users 컬렉션에서 조회
const lookupCommentAuthors = () => {
  return {
    $lookup: {
      from: "users",
      localField: "comments.author",
      foreignField: "_id",
      as: "commentAuthors",
    },
  };
};

// 13. 댓글에 작성자 정보를 추가
const mergeCommentAuthors = () => {
  return {
    $addFields: {
      comments: {
        $map: {
          input: "$comments",
          as: "comment",
          in: {
            $mergeObjects: [
              "$$comment",
              {
                author: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$commentAuthors",
                        as: "author",
                        cond: {
                          $eq: ["$$author._id", "$$comment.author"],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
            ],
          },
        },
      },
    },
  };
};

// 14. 최종 결과 필드 설정
const projectFinalFields = () => {
  return {
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
      isDeleted: "$postData.isDeleted",

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
        isDeleted: "$originalPost.isDeleted",
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
            isDeleted: "$$entry.isDeleted",
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
            isDeleted: "$$comment.isDeleted",
          },
        },
      },
    },
  };
};

const addThreadLastCommentedAt = () => ({
  $addFields: {
    threadLastCommentedAt: {
      $max: {
        $map: {
          input: "$thread",
          as: "entry",
          in: "$$entry.createdAt",
        },
      },
    },
  },
});

const addSortKey = () => ({
  $addFields: {
    sortKey: {
      $ifNull: ["$threadLastCommentedAt", "$createdAt"],
    },
  },
});

const sortBySortKeyDesc = () => ({
  $sort: {
    sortKey: -1 as -1,
  },
});

const addSession = (session?: ClientSession) => {
  return { session };
};

const lookupRepostsByCurrentUser = (currentUser: Types.ObjectId) => ({
  $lookup: {
    from: "posts",
    let: { currentUser },
    pipeline: [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$type", "repost"] },
              { $eq: ["$author", "$$currentUser"] },
              { $eq: ["$isDeleted", false] },
            ],
          },
        },
      },
    ],
    as: "repostsByCurrentUser",
  },
});

const addRepostedOriginalPostIds = () => ({
  $addFields: {
    repostedOriginalPostIds: {
      $map: {
        input: "$repostsByCurrentUser",
        as: "rp",
        in: "$$rp.repostedPostId",
      },
    },
  },
});

const addIsRepostedByCurrentUser = () => ({
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
});

const matchReposts = () => ({
  $match: {
    $or: [
      { "postData.type": { $ne: "repost" } }, // "repost"가 아닌 포스트는 그대로 반환
      { "postData.type": "repost", "postData.originalPostId": { $ne: null } }, // "repost" 중 originalPostId가 있는 것만 가져오기
    ],
  },
});

const replaceRootWithFirstRepost = () => ({
  $addFields: {
    // 첫 번째 리포스트만 선택 (리포스트가 여러 개 있을 수 있기 때문에, 가장 첫 번째 원본 포스트를 찾아서 넣음)
    firstRepost: {
      $arrayElemAt: [
        {
          $filter: {
            input: "$postData.originalPosts", // 원본 포스트 배열
            as: "post",
            cond: { $eq: ["$$post.type", "repost"] }, // type이 "repost"인 것만 필터링
          },
        },
        0, // 첫 번째 리포스트만 선택
      ],
    },
  },
});

const skipPosts = (skip: number, limit: number) => ({
  $skip: skip * limit, // pageNumber에 맞는 문서 건너뛰기
});

const limitResults = (limit: number) => ({
  $limit: limit,
});

export {
  matchPostById,
  matchPostsByUserId,
  graphLookupOriginalPosts,
  addSortedOriginalPosts,
  unwindOriginalPosts,
  lookupOriginalPostAuthor,
  mapAuthorInfoToOriginalPosts,
  groupOriginalPosts,
  addPostData,
  fetchCommentsFromActions,
  fetchCommentsFromActionsWithSkip,
  unwindComments,
  lookupCommentsByPostId,
  lookupCommentAuthors,
  mergeCommentAuthors,
  projectFinalFields,
  addSortKey,
  sortBySortKeyDesc,
  addThreadLastCommentedAt,
  replaceRootWithComments,
  addSession,
  matchReposts,
  replaceRootWithFirstRepost,
  matchPostsByUserAndFollowings,
  addIsRepostedByCurrentUser,
  addRepostedOriginalPostIds,
  lookupRepostsByCurrentUser,
  skipPosts,
  limitResults,
};
