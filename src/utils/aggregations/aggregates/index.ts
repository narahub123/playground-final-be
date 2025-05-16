import aggregatePostsByAuthorIds from "./aggregatePostsByAuthorIds";
import aggregatePostsByCurrentUser from "./aggregatePostsByCurrentUser";
import getPostByPostId from "./postByPostId";
import getPostsWithReplies from "./postsWithRepliesByCurrentUser";

const Aggregate = {
  aggregatePostsByAuthorIds,
  aggregatePostsByCurrentUser,
  getPostByPostId,
  getPostsWithReplies,
};

export default Aggregate;
