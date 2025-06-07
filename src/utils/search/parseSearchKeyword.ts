import { IAdvancedSearch } from "@types";
import { extractQuery } from "@utils";
import {
  ALLKEYWORDS_REGEXP,
  ANYKEYWORDS_REGEXP,
  EXCLUDEKEYWORDS_REGEXP,
  FILTEREXCLUDE_REGEXP,
  FILTERONLY_REGEXP,
  FROMACCOUNTS_REGEXP,
  HASHTAGS_REGEXP,
  MENTIONSTOACCOUNTS_REGEXP,
  MIN_COMMENTS_REGEXP,
  MIN_LIKES_REGEXP,
  MIN_REPOSTS_REGEXP,
  PHRASE_REGEXP,
  REMOVE_CLOSER_REGEXP,
  SINCE_REGEXP,
  TOACCOUNTS_REGEXP,
  UNTIL_REGEXP,
} from "@data";

const parseSearchKeyword = (keyword: string) => {
  const search: IAdvancedSearch = {
    keywords: {
      allKeywords: "",
      phrase: "",
      anyKeywords: "",
      excludeKeywords: "",
      hashtags: "",
    },
    accounts: {
      fromAccounts: "",
      toAccounts: "",
      mentionsToAccounts: "",
    },
    filter: {
      comments: {
        isOn: true,
        range: "",
      },
      links: {
        isOn: true,
        range: "",
      },
    },
    engagement: {
      min_comments: 0,
      min_likes: 0,
      min_reposts: 0,
    },
    period: {
      since: {},
      until: {},
    },
  };

  const cleanedSearchParam = keyword.replace(REMOVE_CLOSER_REGEXP, "");

  const extractAllKeywords = extractQuery(
    cleanedSearchParam,
    ALLKEYWORDS_REGEXP
  );

  search.keywords.allKeywords = extractAllKeywords;

  const extractPhrase = extractQuery(keyword, PHRASE_REGEXP);

  search.keywords.phrase = extractPhrase;

  const extractAnyKeywords = extractQuery(keyword, ANYKEYWORDS_REGEXP);

  search.keywords.anyKeywords = extractAnyKeywords;

  const extractHashtags = extractQuery(keyword, HASHTAGS_REGEXP);

  search.keywords.hashtags = extractHashtags;

  const extractExcludeKeywords = extractQuery(keyword, EXCLUDEKEYWORDS_REGEXP);

  search.keywords.excludeKeywords = extractExcludeKeywords;

  const extractFromAccounts = extractQuery(keyword, FROMACCOUNTS_REGEXP);

  search.accounts.fromAccounts = extractFromAccounts;

  const extractToAccounts = extractQuery(keyword, TOACCOUNTS_REGEXP);

  search.accounts.toAccounts = extractToAccounts;

  const extractMentionsToAccounts = extractQuery(
    keyword,
    MENTIONSTOACCOUNTS_REGEXP
  );

  search.accounts.mentionsToAccounts = extractMentionsToAccounts;

  const extractFilterExclude = extractQuery(keyword, FILTEREXCLUDE_REGEXP);

  const isCommentsOff = extractFilterExclude.includes("comments");
  const isLinksOff = extractFilterExclude.includes("links");

  search.filter.comments.isOn = !isCommentsOff;
  search.filter.links.isOn = !isLinksOff;

  const extractFilterOnly = extractQuery(keyword, FILTERONLY_REGEXP);

  const isCommentsOnly = extractFilterOnly.includes("comments");
  const isLinksOnly = extractFilterOnly.includes("links");

  search.filter.comments.range = isCommentsOnly ? "comments" : "";
  search.filter.links.range = isLinksOnly ? "links" : "";

  const extractMinComments = extractQuery(keyword, MIN_COMMENTS_REGEXP);

  search.engagement.min_comments = Number(extractMinComments);

  const extractMinLikes = extractQuery(keyword, MIN_LIKES_REGEXP);

  search.engagement.min_likes = Number(extractMinLikes);

  const extractMinReposts = extractQuery(keyword, MIN_REPOSTS_REGEXP);

  search.engagement.min_reposts = Number(extractMinReposts);

  const extractSince = extractQuery(keyword, SINCE_REGEXP);

  const splitSince = extractSince.split("-");

  search.period.since = {
    year: Number(splitSince[0]),
    month: Number(splitSince[1]),
    date: Number(splitSince[2]),
  };

  const extractUntil = extractQuery(keyword, UNTIL_REGEXP);

  const splitUntil = extractUntil.split("-");

  search.period.until = {
    year: Number(splitUntil[0]),
    month: Number(splitUntil[1]),
    date: Number(splitUntil[2]),
  };

  return search;
};

export default parseSearchKeyword;
