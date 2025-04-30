import { Types } from "mongoose";

// 1. 주어진 _id에 해당하는 포스트를 필터링
const matchPostById = (_id: Types.ObjectId) => {
  return { $match: { _id } };
};

// 1. 주어진 userId에 해당하는 포스트를 필터링
const matchPostsByUserId = (userId: Types.ObjectId) => {
  return { $match: { author: userId } };
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
        $cond: {
          if: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: "$originalPosts",
                    as: "op",
                    cond: { $in: ["$$op.type", ["repost", "quote"]] },
                  },
                },
              },
              0,
            ],
          },
          then: {
            $first: {
              $filter: {
                input: "$originalPosts",
                as: "op",
                cond: { $in: ["$$op.type", ["repost", "quote"]] },
              },
            },
          },
          else: {
            $cond: {
              if: {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: "$originalPosts",
                        as: "op",
                        cond: { $eq: ["$$op.type", "post"] },
                      },
                    },
                  },
                  0,
                ],
              },
              then: {
                $first: {
                  $filter: {
                    input: "$originalPosts",
                    as: "op",
                    cond: { $eq: ["$$op.type", "post"] },
                  },
                },
              },
              else: null, // repost, quote, post 모두 없으면 null
            },
          },
        },
      },
      originalPost: {
        $cond: {
          if: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: "$originalPosts",
                    as: "op",
                    cond: { $in: ["$$op.type", ["repost", "quote"]] },
                  },
                },
              },
              0,
            ],
          },
          then: {
            $first: {
              $filter: {
                input: "$originalPosts",
                as: "op",
                cond: { $eq: ["$$op.type", "post"] },
              },
            },
          },
          else: null, // repost, quote 타입만 있는 경우
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
      localField: "rootPost.actions.comments",
      foreignField: "_id",
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
      repostedAt: "$postData.repostedAt",
      quotedAt: "$postData.quotedAt",
      commentedAt: "$postData.commentedAt",
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
        repostedAt: "$originalPost.repostedAt",
        quotedAt: "$originalPost.quotedAt",
        commentedAt: "$originalPost.commentedAt",
        createdAt: "$originalPost.createdAt",
        updatedAt: "$originalPost.updatedAt",
        pin: "$originalPost.pin",
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
            repostedAt: "$$entry.repostedAt",
            quotedAt: "$$entry.quotedAt",
            entryedAt: "$$entry.commentedAt",
            createdAt: "$$entry.createdAt",
            updatedAt: "$$entry.updatedAt",
            pin: "$$entry.pin",
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
          },
        },
      },
    },
  };
};

// 15. createdAt을 기준으로 역순으로 정렬
const sortPostsByCreatedAtDesc = () => {
  return { $sort: { createdAt: -1 as -1, "thread.commentedAt": -1 as -1 } };
};

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
  lookupCommentAuthors,
  mergeCommentAuthors,
  projectFinalFields,
  sortPostsByCreatedAtDesc,
};
