import mongoose, { Types } from "mongoose";

interface IVoteOption {
  option: string;
  voters: mongoose.Types.ObjectId[];
}

interface IVote {
  options: IVoteOption[];
  duration: Date;
}

interface IPostRequestDto {
  author: mongoose.Types.ObjectId;
  text?: string;
  media?: string[];
  schedule?: Date;
  vote?: IVote;
}

interface IPostActions {
  comments: string[];
  likes: Types.ObjectId[];
  views: number;
}

interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  text?: string;
  media?: string[];
  schedule?: Date;
  vote?: IVote;
  actions: IPostActions;
  pin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IAuthor {
  _id: mongoose.Types.ObjectId;
  userId: string;
  username: string;
  profileImage: string;
  intro: string;
  followings: string[];
  followers: string[];
}

interface IRepostUser {
  _id: Types.ObjectId;
  userId: string;
  username: string;
  repostId: Types.ObjectId;
  repostedAt: Date;
}

interface IPostActionRepost {
  count: number;
  isReposted: boolean;
}

interface IPostResponseActions {
  comments: string[];
  reposts: IPostActionRepost;
  likes: Types.ObjectId[];
  views: number;
}

interface IPostResponseDto {
  _id: mongoose.Types.ObjectId;
  author: IAuthor;
  text?: string;
  media?: string[];
  schedule?: Date;
  vote?: IVote;
  actions: IPostResponseActions;
  createdAt?: Date;
  updatedAt?: Date;
  repostUser?: IRepostUser;
  pin: boolean;
}

export type {
  IPost,
  IVoteOption,
  IVote,
  IPostRequestDto,
  IPostActions,
  IAuthor,
  IPostResponseDto,
};
