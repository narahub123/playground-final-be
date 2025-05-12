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
}

export default AddFieldsStage;
