import { ISearchAccounts } from "@types";
import { splitToken } from "./searchUtils";

const accountsConditions = (accounts: ISearchAccounts) => {
  const pipelines: any[] = [];

  // fromAccounts
  const fromArr = splitToken(accounts.fromAccounts);

  if (fromArr.length > 0) {
    pipelines.push(
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorData",
        },
      },
      { $unwind: "$authorData" },
      {
        $match: {
          "authorData.userId": { $in: fromArr },
        },
      }
    );
  }

  // toAccounts
  const toArr = splitToken(accounts.toAccounts);

  if (toArr.length > 0) {
    pipelines.push(
      {
        $lookup: {
          from: "posts",
          localField: "originalPostId",
          foreignField: "_id",
          as: "originalPost",
        },
      },
      { $unwind: "$originalPost" },
      {
        $lookup: {
          from: "users",
          localField: "originalPost.author",
          foreignField: "_id",
          as: "originalPostAuthor",
        },
      },
      { $unwind: "$originalPostAuthor" },
      {
        $match: {
          "originalPostAuthor.userId": { $in: toArr },
        },
      }
    );
  }

  // mentionsToAccounts
  const mentionArr = splitToken(accounts.mentionsToAccounts);
  if (mentionArr.length > 0) {
    const mentionRegexList = mentionArr.map(
      (userId) => new RegExp(`@${userId}`, "i")
    );

    pipelines.push({
      $match: {
        $or: mentionRegexList.map((regex) => ({
          text: { $regex: regex },
        })),
      },
    });
  }

  return pipelines;
};

export default accountsConditions;
