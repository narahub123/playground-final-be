import aggregatePostsByAuthorIds from "./postsByAuthorIds";
import aggregatePostsByCurrentUser from "./postsByCurrentUser";
import getPostByPostId from "./postByPostId";
import getPostsWithReplies from "./postsWithRepliesByCurrentUser";
import getPostsByKeyword from "./postsByKeyword";
import getMediaByCurrentUser from "./mediaByCurrentUser";

const Aggregate = {
  aggregatePostsByAuthorIds,
  aggregatePostsByCurrentUser,
  getPostByPostId,
  getPostsWithReplies,
  getPostsByKeyword,
  getMediaByCurrentUser,
};

export default Aggregate;
