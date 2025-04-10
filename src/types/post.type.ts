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

interface IPostActions {
  comments: string[];
  reposts: string[];
  likes: string[];
  views: number;
}

interface IPost extends Document {
  userId: string;
  text?: string;
  media?: string[];
  schedule?: Date;
  vote?: IVote;
  actions: IPostActions;
  createdAt?: Date;
  updatedAt?: Date;
}

export type { IPost, IVoteOption, IVote, PostDTO, IPostActions };
