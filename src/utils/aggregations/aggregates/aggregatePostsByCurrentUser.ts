import { Post } from "@models";
import { IPostResponseDto } from "@types";
import { ClientSession, Types } from "mongoose";

const aggregatePostsByCurrentUser = async (
  authorIds: Types.ObjectId[],
  pageNum: number,
  session?: ClientSession
): Promise<IPostResponseDto[]> => {
  const posts = await Post.aggregate<IPostResponseDto>([]);

  return posts;
};

export default aggregatePostsByCurrentUser;
