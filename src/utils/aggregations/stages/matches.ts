import { ActionFieldType, PostType } from "@types";
import { Types } from "mongoose";
import { keywordsConditions, parseSearchKeyword } from "utils/search";

class MatchStage {
  static authorIds(authorIds: Types.ObjectId[]) {
    return {
      $match: {
        author: { $in: authorIds },
        isDeleted: false,
        $or: [
          { type: { $nin: ["repost", "quote"] } },
          {
            type: { $in: ["repost", "quote"] },
            isOriginalPostDeleted: false,
          },
        ],
      },
    };
  }

  static matchByType(type: PostType) {
    return {
      $match: { type: type },
    };
  }

  static excludeOriginalPost() {
    return {
      $match: {
        $expr: {
          $ne: ["$_id", "$originalPost._id"],
        },
      },
    };
  }

  static excludeType(excludedTypes: PostType[]) {
    return {
      $match: {
        type: {
          $nin: excludedTypes,
        },
      },
    };
  }

  static filterRepostsByAuthorAndStatus() {
    return {
      $match: {
        $expr: {
          $and: [
            { $eq: ["$type", "repost"] }, // 타입이 'repost'인 문서만 필터링
            { $eq: ["$author", "$$currentUser"] }, // 현재 사용자가 작성한 리포스트만 필터링
            { $eq: ["$isDeleted", false] }, // 삭제되지 않은 리포스트만 포함
            { $eq: ["$isOriginalPostDeleted", false] }, // 원본 포스트가 삭제되지 않은 리포스트만 포함
          ],
        },
      },
    };
  }

  static postId(postId: Types.ObjectId) {
    return {
      $match: {
        _id: postId,
      },
    };
  }

  static media(userId: Types.ObjectId) {
    return { $match: { author: userId, isDeleted: false, media: { $ne: [] } } };
  }

  static search(keyword: string) {
    const { keywords } = parseSearchKeyword(keyword);

    const keyCond = keywordsConditions(keywords);

    console.log(keyCond);

    return {
      $match: {
        $and: [...keyCond],
        isDeleted: false,
      },
    };
  }
}

export default MatchStage;
