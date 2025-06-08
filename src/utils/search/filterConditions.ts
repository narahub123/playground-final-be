import { ISearchFilter } from "@types";

const filterConditions = (filter: ISearchFilter) => {
  const { comments, links } = filter;

  const URLREGEX =
    /(?<=^|[^\w\d@#$-])((?:https?|ftp):\/\/)?(?:www\.)?[a-z0-9][a-z0-9-]*(?:\.[a-zA-Z]{2,})?(?:\.[a-zA-Z]{2,3})(?:\/[\p{L}0-9+-_]*)?(?=$|\s|[^\d\w.+-@/])/giu;

  const conditions = [];

  if (comments.isOn === false) {
    conditions.push({ type: { $ne: "comment" } });
  } else if (comments.isOn === true && comments.range === "comments") {
    conditions.push({ type: "comment" });
  }

  if (links.isOn === false) {
    // url이 없는 것만
    conditions.push({ text: { $not: /(https?:\/\/|www\.)[^\s]+/i } });
  } else if (links.isOn === true && links.range === "links") {
    conditions.push({ text: { $regex: URLREGEX } });
  }

  if (conditions.length === 0) return [];

  return conditions;
};

export default filterConditions;
