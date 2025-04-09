interface IVoteOption {
  option: string;
  count: number;
}

interface IVote {
  options: IVoteOption[];
  duration: Date;
}

interface PostDTO {
  userId: string;
  text?: string;
  media?: string[];
  schedule?: Date;
  vote?: IVote;
}

interface IPost extends Document {
  userId: string;
  text?: string;
  media?: string[];
  schedule?: Date;
  vote?: IVote;
  createdAt?: Date;
  updatedAt?: Date;
}

export type { IPost, IVoteOption, IVote, PostDTO };
