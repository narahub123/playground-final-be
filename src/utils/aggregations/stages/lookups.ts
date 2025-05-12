import { Types } from "mongoose";
import { GroupStage, MatchStage, ReplaceRootStage } from "@utils";

class LookupStage {
  static originalPost(localField: string) {
    return {
      $lookup: {
        from: "posts",
        localField: localField,
        foreignField: "_id",
        as: "originalPosts",
      },
    };
  }

  static originalPostWithPipeline(localField: string) {
    return {
      $lookup: {
        from: "posts",
        localField: localField,
        foreignField: "_id",
        as: "originalPosts",
        pipeline: [MatchStage.matchByType("comment")],
      },
    };
  }

  static repostsByCurrentUser(currentUser: Types.ObjectId) {
    return {
      $lookup: {
        from: "posts",
        let: { currentUser: currentUser },
        pipeline: [
          MatchStage.filterRepostsByAuthorAndStatus(),
          GroupStage.removeDuplicateOriginalPost(),
          ReplaceRootStage.replaceRoot("repost"),
        ],
        as: "repostsByCurrentUser",
      },
    };
  }

  static author(localField: string, aka: string) {
    return {
      $lookup: {
        from: "users", // 사용자 정보가 담긴 컬렉션 이름
        localField, // 현재 포스트의 author 필드
        foreignField: "_id", // 'users' 컬렉션의 _id와 매칭
        as: aka, // 결과를 authorInfo 배열로 가져옵니다.
      },
    };
  }

  static graphLookupOriginalPost() {
    return {
      $graphLookup: {
        from: "posts",
        startWith: "$originalPostId",
        connectFromField: "originalPostId",
        connectToField: "_id",
        as: "originalPosts",
        maxDepth: 10,
        depthField: "level",
      },
    };
  }
}

export default LookupStage;
