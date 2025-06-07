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
  repostedPostId: Types.ObjectId;
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
  repostedPostId?: Types.ObjectId;
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
  repostedPostId?: Types.ObjectId;
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

interface ISearchKeywords {
  allKeywords: string;
  phrase: string;
  anyKeywords: string;
  excludeKeywords: string;
  hashtags: string;
}

interface ISearchAccounts {
  fromAccounts: string;
  toAccounts: string;
  mentionsToAccounts: string;
}

interface ISearchFilter {
  comments: {
    isOn: boolean;
    range: "" | "comments";
  };
  links: {
    isOn: boolean;
    range: "" | "links";
  };
}

interface ISearchEngagement {
  min_comments: number;
  min_likes: number;
  min_reposts: number;
}

interface ISearchPeriod {
  since: {
    year?: number;
    month?: number;
    date?: number;
  };
  until: {
    year?: number;
    month?: number;
    date?: number;
  };
}

interface IAdvancedSearch {
  keywords: ISearchKeywords;
  accounts: ISearchAccounts;
  filter: ISearchFilter;
  engagement: ISearchEngagement;
  period: ISearchPeriod;
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
  IAdvancedSearch,
  ISearchKeywords,
  ISearchAccounts,
  ISearchFilter,
  ISearchEngagement,
  ISearchPeriod,
};
