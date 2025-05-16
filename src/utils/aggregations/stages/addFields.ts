class AddFieldsStage {
  static repostsByCurrentUser() {
    return {
      $addFields: {
        repostedOriginalPostIds: {
          $map: {
            input: "$repostsByCurrentUser",
            as: "rp",
            in: "$$rp.originalPostId",
          },
        },
      },
    };
  }

  static flattenAuthorIntoPostsArray() {
    return {
      $addFields: {
        "postsArray.author": { $arrayElemAt: ["$authors", 0] },
      },
    };
  }

  static trimOriginalPostsOnFirstDeleted() {
    return {
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
    };
  }

  static distributePosts() {
    return {
      $addFields: {
        postData: {
          $let: {
            vars: {
              repostQuote: {
                $filter: {
                  input: "$postsArrayWithAuthors",
                  as: "op",
                  cond: { $in: ["$$op.type", ["repost", "quote"]] },
                },
              },
              original: {
                $filter: {
                  input: "$postsArrayWithAuthors",
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
                  input: "$postsArrayWithAuthors",
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
          $sortArray: {
            input: {
              $filter: {
                input: "$postsArrayWithAuthors",
                as: "op",
                cond: { $eq: ["$$op.type", "comment"] },
              },
            },
            sortBy: { commentedAt: 1 },
          },
        },
      },
    };
  }

  static combineRootAndOriginalPosts() {
    return {
      $addFields: {
        postsArray: {
          $concatArrays: [
            ["$$ROOT"], // 현재 문서(객체)를 배열로 감싸기
            { $ifNull: ["$originalPosts", []] }, // originalPosts 배열 꺼내기 (null 방지)
          ],
        },
      },
    };
  }

  static addAuthorToComment() {
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
  }

  static addThreadLastCommentedAt() {
    return {
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
    };
  }

  static addSortKey() {
    return {
      $addFields: {
        sortKey: {
          $ifNull: ["$threadLastCommentedAt", "$createdAt"],
        },
      },
    };
  }
}

export default AddFieldsStage;
