import { Request, Response } from "express";
import { BadRequestError } from "@errors";
import { asyncWrapper } from "@middlewares";
import { fetchUserByUserId } from "@services";

const getUserByUserId = asyncWrapper(
  "getUserById",
  async (req: Request, res: Response) => {
    const { userId } = req.body;

    if (!userId) {
      throw new BadRequestError("사용자 아이디를 제공해주세요.");
    }

    const user = await fetchUserByUserId(userId);

    res.status(200).json(user);
  }
);

const getUserByEmail = asyncWrapper(
  "getUserById",
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError("사용자 아이디를 제공해주세요.");
    }

    const user = await fetchUserByUserId(email);

    res.status(200).json(user);
  }
);

export { getUserByUserId, getUserByEmail };
