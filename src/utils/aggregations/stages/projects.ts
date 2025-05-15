class ProjectStage {
  static combineFields(combinedField: string, concatArrays: string[]) {
    return {
      $project: {
        [combinedField]: {
          $concatArrays: concatArrays,
        }, // 댓글, 리포스트, 다른 포스트들을 합침
      },
    };
  }

  static commentOrignalPostIds() {
    return {
      $project: {
        originalPostId: 1,
      },
    };
  }

  static filterComments() {
    return {
      $project: {
        comments: {
          $filter: {
            input: "$comments",
            as: "comment",
            cond: {
              $not: {
                $in: [
                  "$$comment._id",
                  {
                    $map: {
                      input: "$originalPostIds",
                      as: "op",
                      in: "$$op.originalPostId",
                    },
                  },
                ],
              },
            },
          },
        },
        reposts: 1,
        others: 1,
      },
    };
  }

  static posts() {
    return {
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
    };
  }

  static reposts() {
    return {
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
    };
  }

  static quotes() {
    return {
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
    };
  }

  static comments() {
    return {
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
    };
  }

  static combineRootAndOriginalPosts() {
    return {
      $project: {
        postsArray: [
          "$$ROOT", // 현재 'repost' 데이터
          "$originalPosts", // 'originalPost' 데이터
        ],
      },
    };
  }

  static flattenRootAndOriginalPosts() {
    return {
      $project: {
        postsArray: {
          $concatArrays: [
            ["$$ROOT"], // 현재 문서(객체)를 배열로 감싸기
            { $ifNull: ["$originalPosts", []] }, // originalPosts 배열 꺼내기 (null 방지)
          ],
        },
      },
    };
  }

  static fullPostStructure() {
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
              isOriginalPostDeleted: "$$comment.isOriginalPostDeleted",
              isDeleted: "$$comment.isDeleted",
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
    };
  }
}

export default ProjectStage;
