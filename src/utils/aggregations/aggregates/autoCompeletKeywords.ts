import { SearchHistory } from "@models";
import { ISearchHistory } from "@types";

const getAutoCompleteKeywords = async (keyword: string): Promise<string[]> => {
  const regex = new RegExp(`^${keyword}`, "i");

  const result = await SearchHistory.aggregate<ISearchHistory>([
    {
      $match: {
        query: { $regex: regex },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$query",
        count: { $sum: 1 },
        lastestCreatedAt: { $max: "$createdAt" },
      },
    },
    {
      $sort: {
        count: -1,
        lastestCreatedAt: -1,
      },
    },
    {
      $limit: 5,
    },
    {
      $project: {
        query: "$_id",
      },
    },
  ]);

  console.log(result);

  const keywords = result.map((item) => item.query);

  return keywords;
};

export default getAutoCompleteKeywords;
