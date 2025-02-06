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

// 계정 정보로 연락처를 조회하는 API 핸들러
const getContactsByAccount = asyncWrapper(
  "getContactsByAccount",
  async (req: Request, res: Response) => {
    // 요청 본문에서 사용자 ID, 이메일, 전화번호 추출
    const { userId, email, phone } = req.body;

    // 이메일, 휴대 전화 번호, 사용자 아이디 중 하나라도 없으면 BadRequestError 발생
    if (!userId && !email && !phone)
      throw new BadRequestError(
        "이메일, 휴대 전화 번호 혹은 사용자 아이디를 제공해주세요."
      );

    // 이메일, 전화번호, 사용자 ID를 기준으로 사용자를 찾기 위한 메서드 배열 정의
    const fetchUserMethods = [
      { key: email, fetch: fetchUserByEmail }, // 이메일로 사용자 조회
      { key: phone, fetch: fetchUserByPhone }, // 전화번호로 사용자 조회
      { key: userId, fetch: fetchUserByUserId }, // 사용자 ID로 사용자 조회
    ];

    // 주어진 키(email, phone, userId)를 기준으로 사용자 정보 조회
    for (const { key, fetch } of fetchUserMethods) {
      // 키가 존재하는 경우에만 해당 메서드를 사용하여 사용자 정보를 조회
      if (key) {
        const user = await fetch(key);

        // 사용자가 존재하면 이메일과 전화번호 반환
        if (user) {
          return res.status(200).json({
            success: true,
            data: { emails: user.email, phones: user.phone },
          });
        }
      }
    }

    // 모든 조건에 맞는 사용자를 찾지 못한 경우 NotFoundError 발생
    throw new NotFoundError("조건에 맞는 유저를 찾을 수 없습니다.");
  }
);

export { verifyPasswordLogin, getContactsByAccount };
