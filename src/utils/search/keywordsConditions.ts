import { ISearchKeywords } from "@types";
import { splitToken } from "./searchUtils";

const keywordsConditions = (keywords: ISearchKeywords) => {
  const { allKeywords, phrase, anyKeywords, excludeKeywords, hashtags } =
    keywords;

  const conditions: any[] = [];

  const allArr = splitToken(allKeywords);
  const anyArr = splitToken(anyKeywords);
  const excludeArr = splitToken(excludeKeywords);
  const hashtagsArr = splitToken(hashtags);

  // All Keywords → 모두 포함되어야 하므로 $and로 각각 조건화
  if (allArr.length > 0) {
    conditions.push(
      ...allArr.map((word) => ({
        text: { $regex: word, $options: "i" },
      }))
    );
  }

  // Phrase → 전체 문장 포함
  if (phrase?.trim()) {
    conditions.push({ text: { $regex: phrase, $options: "i" } });
  }

  // Any Keywords → 하나라도 포함되어야 하므로 $or
  if (anyArr.length > 0) {
    conditions.push({
      $or: anyArr.map((word) => ({
        text: { $regex: word, $options: "i" },
      })),
    });
  }

  // Exclude Keywords → 포함되지 않아야 함
  if (excludeArr.length > 0) {
    conditions.push(
      ...excludeArr.map((word) => ({
        text: { $not: new RegExp(word, "i") },
      }))
    );
  }

  // Hashtags → #tag 형식으로 포함되어야 함
  if (hashtagsArr.length > 0) {
    const hashtagRegex = new RegExp(
      hashtagsArr.map((tag) => `#${tag}`).join("|"),
      "i"
    );
    conditions.push({ text: { $regex: hashtagRegex } });
  }

  return conditions;
};

export default keywordsConditions;
