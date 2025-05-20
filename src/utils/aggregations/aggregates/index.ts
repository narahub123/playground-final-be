import aggregatePostsByAuthorIds from "./postsByAuthorIds";
import aggregatePostsByCurrentUser from "./postsByCurrentUser";
import getPostByPostId from "./postByPostId";
import getPostsWithReplies from "./postsWithRepliesByCurrentUser";
import getPostsByKeyword from "./postsByKeyword";
import getMediaByCurrentUser from "./mediaByCurrentUser";
import getAutoCompleteKeywords from "./autoCompeletKeywords";

const Aggregate = {
  aggregatePostsByAuthorIds,
  aggregatePostsByCurrentUser,
  getPostByPostId,
  getPostsWithReplies,
  getPostsByKeyword,
  getMediaByCurrentUser,
  getAutoCompleteKeywords,
};

export default Aggregate;
