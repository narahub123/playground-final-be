class SetStage {
  static mergeIsRepostedByCurrentUser() {
    return {
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
    };
  }
}

export default SetStage;
