import { Request, Response } from "express";
import { BadRequestError } from "@errors";
import { asyncWrapper } from "@middlewares";
import { fetchUserByUserId } from "@services";

const getUserByUserId = asyncWrapper(
  "getUserById",
  async (req: Request, res: Response) => {
    const { userId } = req.user;

    if (!userId) {
      throw new BadRequestError("사용자 아이디를 제공해주세요.");
    }

    try {
      const user = await fetchUserByUserId(userId);

      res.status(200).json(user);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }
);

export { getUserByUserId };
