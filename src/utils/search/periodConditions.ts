import { ISearchPeriod } from "@types";

const periodConditions = (period: ISearchPeriod) => {
  const { since, until } = period;

  let sinceDate;
  if (since?.year && since?.month && since?.date) {
    sinceDate = new Date(since.year, since.month - 1, since.date);
  }

  let untilDate;
  if (until?.year && until?.month && until?.date) {
    untilDate = new Date(
      until.year,
      until.month - 1,
      until.date,
      23,
      59,
      59,
      999
    );
  }

  if (!sinceDate && !untilDate) return {};

  const createdAt: Record<string, Date> = {};
  if (sinceDate) createdAt.$gte = sinceDate;
  if (untilDate) createdAt.$lte = untilDate;

  return { createdAt };
};

export default periodConditions;
