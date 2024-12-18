import { Request, Response } from "express";
import { BadRequestError } from "@errors";
import { asyncWrapper } from "@middlewares";
import {
  fetchUserByEmail,
  fetchUserByPhone,
  fetchUserByUserId,
} from "@services";

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
  "getUserByEmail",
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError("사용자 아이디를 제공해주세요.");
    }

    const user = await fetchUserByEmail(email);

    res.status(200).json(user);
  }
);

const getUserByPhone = asyncWrapper(
  "getUserByPhone",
  async (req: Request, res: Response) => {
    const { phone } = req.body;

    if (!phone) {
      throw new BadRequestError("사용자 아이디를 제공해주세요.");
    }

    const user = await fetchUserByPhone(phone);

    res.status(200).json(user);
  }
);

export { getUserByUserId, getUserByEmail, getUserByPhone };
