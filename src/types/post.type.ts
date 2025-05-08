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

interface IQuoteRequestDto {
  type: "quote";
  author: Types.ObjectId;
  originalPostId: Types.ObjectId;
  text?: string;
  media: string[];
}

interface IRepostRequestDto {
  type: "repost";
  author: Types.ObjectId;
  originalPostId: Types.ObjectId;
}

interface ICommentRequestDto {
  type: "comment";
  author: mongoose.Types.ObjectId;
  text?: string;
  media?: string[];
  originalPostId: Types.ObjectId;
}

interface IPostActions {
  comments: number;
  reposts: number;
  likes: number;
  bookmarks: number;
  views: number;
}

type PostType = "post" | "repost" | "quote" | "comment";

interface IPost extends Document {
  _id: Types.ObjectId;

  type: PostType;

  author: Types.ObjectId;

  text?: string;
  media?: string[];
  schedule?: Date;
  vote?: IVote;

  actions: IPostActions;

  originalPostId?: Types.ObjectId;
  isOriginalPostDeleted: boolean;

  // repost인 경우
  repostedAt?: Date;

  // quote인 경우
  quotedAt?: Date;

  // comment인 경우
  commentedAt?: Date;

  pin: boolean; // 전체 고정을 하는 경우

  isDeleted: boolean;

  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
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

interface IPostResponseDto {
  _id: mongoose.Types.ObjectId;
  type: PostType;
  author: IAuthor;
  text?: string;
  media?: string[];
  schedule?: Date;
  vote?: IVote;
  actions: IPostActions;
  originalPost?: IPostResponseDto;
  originalPostId?: Types.ObjectId;
  repostedAt?: Date;
  quotedAt?: Date;
  commentedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  pin: boolean;
  thread?: IPostResponseDto[];
  comments?: IPostResponseDto[];
  isRepostedByCurrentUser: boolean;
}

export type {
  IPost,
  IVoteOption,
  IVote,
  IPostRequestDto,
  IPostActions,
  IAuthor,
  IPostResponseDto,
  IRepostRequestDto,
  ICommentRequestDto,
  PostType,
  IQuoteRequestDto,
};
