import { ISearchEngagement } from "@types";

const engagementConditions = (engagement: ISearchEngagement) => {
  const { min_comments, min_likes, min_reposts } = engagement;

  const conditions = [];

  if (min_comments) {
    conditions.push({ "actions.comments": { $gte: min_comments } });
  }

  if (min_likes) {
    conditions.push({ "actions.likes": { $gte: min_likes } });
  }

  if (min_reposts) {
    conditions.push({ "actions.reposts": { $gte: min_reposts } });
  }

  if (conditions.length === 0) return [];

  return conditions;
};

export default engagementConditions;
