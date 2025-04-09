import { IVote, IVoteOption } from "@types";

const modifyVote = (vote: any): IVote | undefined => {
  let modifiedVote: IVote | undefined;

  if (vote && vote.options.length > 1) {
    const newOptions: IVoteOption[] = (vote.options as string[]).map(
      (option) => ({
        option,
        count: 0,
      })
    );

    modifiedVote = {
      options: newOptions,
      duration: vote.duration,
    };
  }

  return modifiedVote;
};

export default modifyVote;
