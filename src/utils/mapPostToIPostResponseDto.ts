import { IAuthor, IPost, IPostResponseDto } from "@types";

const mapPostToIPostResponseDto = (
  post: IPost & { author: IAuthor }
): IPostResponseDto => {
  return {
    _id: post._id,
    author: {
      _id: post.author._id,
      userId: post.author.userId,
      username: post.author.username,
      profileImage: post.author.profileImage,
    },
    text: post.text,
    media: post.media,
    schedule: post.schedule,
    vote: post.vote,
    actions: post.actions,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

export default mapPostToIPostResponseDto;
