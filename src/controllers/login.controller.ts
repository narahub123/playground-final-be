import { Request, Response } from "express";
import { asyncWrapper } from "@middlewares";
import { BadRequestError, NotFoundError, UnauthorizedError } from "@errors";
import {
  fetchUserByEmail,
  fetchUserByPhone,
  fetchUserByUserId,
} from "services/user.service";
import { comparePassword } from "@utils";

// 비밀번호 유효성 검사
const verifyPasswordLogin = asyncWrapper(
  "verifyPasswordLogin",
  async (req: Request, res: Response) => {
    const { email, phone, userId, password } = req.body;

    // 비밀번호가 제공되지 않은 경우 에러 발생
    if (!password) {
      throw new BadRequestError("확인할 비밀번호를 제공해주세요.");
    }

    // 이메일, 전화번호, 사용자 ID 중 하나도 제공되지 않은 경우 에러 발생
    if (!email && !phone && !userId) {
      throw new BadRequestError(
        "이메일, 휴대전화 번호 혹은 사용자 이름을 제공해주세요."
      );
    }

    // 이메일, 전화번호, 사용자 ID를 기준으로 사용자를 찾기 위한 메서드 배열 정의
    const fetchUserMethods = [
      { key: email, fetch: fetchUserByEmail },
      { key: phone, fetch: fetchUserByPhone },
      { key: userId, fetch: fetchUserByUserId },
    ];

    let user;

    // 주어진 키를 기준으로 사용자 정보 조회
    for (const { key, fetch } of fetchUserMethods) {
      // 키가 존재하면 해당 메서드를 사용해 사용자 정보 조회
      if (key) {
        user = await fetch(key);
        if (user) break; // 사용자 정보를 찾은 경우 반복문 종료
      }
    }

    // 사용자 정보를 찾을 수 없는 경우 에러 발생
    if (!user) {
      throw new NotFoundError("조건에 맞는 유저를 찾을 수 없습니다.");
    }

    // 제공된 비밀번호가 유효한지 검증
    const isValid = await comparePassword(password, user.password);

    // 비밀번호가 일치하지 않으면 Unauthorized 에러 발생
    if (!isValid) {
      throw new UnauthorizedError("비밀번호가 일치하지 않습니다.");
    }

    // 비밀번호가 일치하는 경우 성공적으로 검증된 결과 반환
    res.status(200).json(isValid);
  }
);

export { verifyPasswordLogin };
