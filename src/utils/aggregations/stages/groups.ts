class GroupStage {
  static removeDuplicateOriginalPost() {
    return {
      $group: {
        _id: "$originalPostId",
        repost: { $first: "$$ROOT" },
      },
    };
  }

  static createPostsArrayWithAuthors() {
    return {
      $group: {
        _id: "$_id", // 문서 기준 ID (필요 시 다른 키)
        postsArrayWithAuthors: { $push: "$postsArray" },
      },
    };
  }
}

export default GroupStage;
