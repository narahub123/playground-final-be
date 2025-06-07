// 정규 표현식을 이용한 추출
const extractAllMatches = (base: string, regExp: RegExp): string[] => {
  return [...base.matchAll(regExp)].map((m) => m[0]);
};

// 감싸고 있는 () 혹은 "" 제거 하기
const cleanItems = (array: string[]): string[] => {
  return array.map((item) =>
    item.replace(/"([^"]*)"/g, "$1").replace(/\(([^)]*)\)/g, "$1")
  );
};

//
const joinItems = (array: string[]) => {
  return array.join(" ");
};

const splitJoined = (joined: string): string[] => {
  return joined.split(/\s+OR\s+|\s+/i); // i 옵션으로 대소문자 구분 제거
};

const removePreFix = (array: string[]) => {
  return array.map((token) =>
    token
      // 키워드 접두사 (예: from:, min_comments:, filter:) 제거
      .replace(/^[\w-]+:/, "")
      // - 또는 @ 또는 # 단독 접두어 제거
      .replace(/^[-@#]/, "")
  );
};

const extractQuery = (base: string, regExp: RegExp): string => {
  // 조건에 맞는 부분 추출
  const extractedArray = extractAllMatches(base, regExp);

  // 각 부분의 감싸고 있는 부분 제거
  const cleaned = cleanItems(extractedArray);

  // 배열 합치기
  const joined = joinItems(cleaned);

  // join 분리하기
  const splitJoin = splitJoined(joined);

  // 접두어 삭제하기
  const pureItems = removePreFix(splitJoin);

  // 합치기
  return joinItems(pureItems);
};

const splitQuery = (query: string) => {
  return query.trim().split(/\s+/);
};

export { extractQuery, splitQuery };
