import aggregatePostsByAuthorIds from "./postsByAuthorIds";
import aggregatePostsByCurrentUser from "./postsByCurrentUser";
import getPostByPostId from "./postByPostId";
import getPostsWithReplies from "./postsWithRepliesByCurrentUser";
import getPostsByKeyword from "./postsByKeyword";

const Aggregate = {
  aggregatePostsByAuthorIds,
  aggregatePostsByCurrentUser,
  getPostByPostId,
  getPostsWithReplies,
  getPostsByKeyword,
};

export default Aggregate;
