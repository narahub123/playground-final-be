import mongoose from "mongoose";

interface IVoteOption {
  option: string;
  count: number;
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
  reposts: string[];
  likes: string[];
  views: number;
}

interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  text?: string;
  media?: string[];
  schedule?: Date;
  vote?: IVote;
  actions: IPostActions;
  createdAt?: Date;
  updatedAt?: Date;
}

export type { IPost, IVoteOption, IVote, IPostRequestDto, IPostActions };
