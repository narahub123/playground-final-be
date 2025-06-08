const ALLKEYWORDS_REGEXP = /^([^\s()@#:\-]+(?:\s+[^\s()@#:\-]+)*)/g;
const PHRASE_REGEXP = /"([^"]+)"/g;
const ANYKEYWORDS_REGEXP = /\(((?![#@]|from:|to:)[^)]*?\sOR\s[^)]*?)\)/g;
const HASHTAGS_REGEXP = /\(\s*(#[^\s()#]+(?:\s+OR\s+#[^\s()#]+)*)\s*\)/g;
const EXCLUDEKEYWORDS_REGEXP =
  /-(?!filter:)(?!\d{2}(?:-\d{2})?)(?!\d{4}-\d{2}-\d{2})[^\s:()@#"\d]+/g;
const FROMACCOUNTS_REGEXP = /\(([^)]*from:[^)]*)\)/g;
const TOACCOUNTS_REGEXP = /\(([^)]*to:[^)]*)\)/g;
const MENTIONSTOACCOUNTS_REGEXP =
  /\(\s*(@[^\s()@]+(?:\s+OR\s+@[^\s()@]+)*)\s*\)/g;
const FILTERONLY_REGEXP = /(?<!-)\bfilter:[^\s)]+/g;
const FILTEREXCLUDE_REGEXP = /-filter:[^\s)]+/g;
const MIN_COMMENTS_REGEXP = /\b(min_comments):(\d+)/g;
const MIN_LIKES_REGEXP = /\b(min_likes):(\d+)/g;
const MIN_REPOSTS_REGEXP = /\b(min_reposts):(\d+)/g;
const SINCE_REGEXP = /\bsince:[^\s)]+/g;
const UNTIL_REGEXP = /\buntil:[^\s)]+/g;
const REMOVE_CLOSER_REGEXP = /"(.*?)"|\((.*?)\)|[^\s()@#:\-]+:[^\s()@#:\-]+/g;

export {
  ALLKEYWORDS_REGEXP,
  PHRASE_REGEXP,
  ANYKEYWORDS_REGEXP,
  HASHTAGS_REGEXP,
  EXCLUDEKEYWORDS_REGEXP,
  FROMACCOUNTS_REGEXP,
  TOACCOUNTS_REGEXP,
  MENTIONSTOACCOUNTS_REGEXP,
  FILTERONLY_REGEXP,
  FILTEREXCLUDE_REGEXP,
  MIN_COMMENTS_REGEXP,
  MIN_LIKES_REGEXP,
  MIN_REPOSTS_REGEXP,
  SINCE_REGEXP,
  UNTIL_REGEXP,
  REMOVE_CLOSER_REGEXP,
};
