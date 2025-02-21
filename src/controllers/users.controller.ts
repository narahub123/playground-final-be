import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "@errors";
import { asyncWrapper } from "@middlewares";
import {
  activeSessionService,
  displayService,
  duplicateDetectionService,
  loginRecordService,
  notificationService,
  privacyService,
  securityService,
  userService,
} from "@services";
import { IApiSuccessResponse } from "@types";

const checkEmailDuplication = asyncWrapper(
  "checkEmailDuplication",
  "Email duplicate check failed. (이메일 중복 체크 실패)",
  "EMAIL_DUPLICATE_CHECK_FAILED", // 이메일 중복 체크 실패
  async (req: Request, res: Response) => {
    // 요청 본문에서 이메일을 추출합니다.
    const { email } = req.body;

    // 이메일이 제공되지 않았을 경우 BadRequestError를 던집니다.
    if (!email) {
      throw new BadRequestError(
        "Email is required. (이메일 필수)",
        "VALIDATION_ERROR",
        {
          email: "MISS_EMAIL",
        }
      );
    }

    // 이메일 중복 체크
    const isDuplicate = await duplicateDetectionService.isEmailDuplicate(email);

    const response: IApiSuccessResponse<{ isDuplicate: boolean }> = {
      success: true,
      message: "Email duplicate check succeeded. (이메일 중복 체크 성공)",
      code: "EMAIL_DUPLICATE_CHECK_SUCCEEDED",
      timestamp: new Date().toISOString(),
      data: { isDuplicate },
    };

    // 중복 여부를 클라이언트에 JSON 형식으로 반환합니다.
    res.status(200).json(response);
  }
);

const checkPhoneDuplication = asyncWrapper(
  "checkPhoneDuplication",
  "Phone duplicate check failed. (휴대 전화 번호 중복 체크 실패)",
  "PHONE_DUPLICATE_CHECK_FAILED", // 휴대 전화 번호 중복 체크 실패
  async (req: Request, res: Response) => {
    // 요청 본문에서 휴대 전화 번호를 추출합니다.
    const { phone } = req.body;

    // 휴대 전화 번호가 제공되지 않았을 경우 BadRequestError를 던집니다.
    if (!phone) {
      throw new BadRequestError(
        "Phone is required. (휴대 전화 번호 필수)",
        "VALIDATION_ERROR", // 에러 코드
        {
          phone: "MISSING_PHONE",
        }
      );
    }

    // 휴대 전화 번호 중복 체크
    const isDuplicate = await duplicateDetectionService.isPhoneDuplication(
      phone
    );

    const response: IApiSuccessResponse<{ isDuplicate: boolean }> = {
      success: true,
      message:
        "Phone duplicate check succeeded. (휴대 전화 번호 중복 체크 성공)",
      code: "PHONE_DUPLICATE_CHECK_SUCCEEDED",
      timestamp: new Date().toISOString(),
      data: { isDuplicate },
    };

    // 중복 여부를 클라이언트에 JSON 형식으로 반환합니다.
    res.status(200).json(response);
  }
);

const checkUserIdDuplication = asyncWrapper(
  "checkUserIdDuplication", // 함수의 이름
  "UserId duplicate check failed. (사용자 아이디 중복 체크 실패)", // 에러 메시지
  "USERID_DUPLICATE_CHECK_FAILED", // 사용자 아이디 중복 체크 실패
  async (req: Request, res: Response) => {
    // 요청 본문에서 사용자 아이디를 추출합니다.
    const { userId } = req.body;

    // 사용자 아이디가 제공되지 않았을 경우 BadRequestError를 던집니다.
    if (!userId) {
      throw new BadRequestError(
        "UserId is required. (사용자 아이디 필수)", // 에러 메시지
        "VALIDATION_ERROR", // 에러 코드
        {
          userId: "MISSING_USERID",
        }
      );
    }

    // 사용자 아이디 중복 체크
    const isDuplicate = await duplicateDetectionService.isUserIdDuplicate(
      userId
    );

    // 성공적인 응답 생성
    const response: IApiSuccessResponse<{ isDuplicate: boolean }> = {
      success: true,
      message:
        "UserId duplicate check succeeded. (사용자 아이디 중복 체크 성공)", // 성공 메시지
      code: "USERID_DUPLICATE_CHECK_SUCCEEDED", // 응답 코드
      timestamp: new Date().toISOString(), // 응답 시각
      data: { isDuplicate }, // 중복 여부
    };

    // 중복 여부를 클라이언트에 JSON 형식으로 반환합니다.
    res.status(200).json(response);
  }
);

// 계정 정보로 연락처를 조회하는 API 핸들러
const getContactsBeforeLogin = asyncWrapper(
  "getContactsByAccount",
  "Failed to fetch contacts. (연락처 조회 실패)",
  "GET_CONTACTS_FAILED", // 연락처 조회 실패
  async (req: Request, res: Response) => {
    // 요청 본문에서 사용자 ID, 이메일, 전화번호 추출
    const { userId, email, phone } = req.body;

    // 이메일, 휴대 전화 번호, 사용자 아이디 중 하나라도 없으면 BadRequestError 발생
    if (!userId && !email && !phone) {
      throw new BadRequestError(
        "At least one of email, phone, and userId is required. (이메일, 휴대전화번호, 사용자 아이디 중 최소 하나는 필수)", // 에러 메시지
        "VALIDATION_ERROR", // 에러 코드
        {
          email: "MISSING_EMAIL", // 에러 세부사항
          phone: "MISSING_PHONE", // 에러 세부사항
          userId: "MISSING_USERID", // 에러 세부사항
        }
      );
    }

    const user = await userService.findUserByIdentifier(email, phone, userId);

    const { emails, phones } = await userService.getContactsByIdentifier(
      user.userId
    );

    // 성공적인 응답 생성
    const response: IApiSuccessResponse<{
      emails: string[];
      phones: string[];
    }> = {
      success: true,
      message: "Contacts fetched successfully. (연락처 조회 성공)", // 성공 메시지
      code: "GET_CONTACTS_SUCCEEDED", // 응답 코드
      timestamp: new Date().toISOString(), // 응답 시각
      data: {
        emails: emails.map((item) => item.email),
        phones: phones.map((item) => item.phone),
      }, // 중복 여부
    };

    res.status(200).json(response);
  }
);

const getCurrentUser = asyncWrapper(
  "getCurrentUser",
  "User not found. (사용자를 찾을 수 없음)",
  "USER_NOT_FOUND",
  async (req: Request, res: Response) => {
    const user = req.user;

    const userData = user.toObject();
    
    let newAccountGroup = [];

    for (const userId of user.accountGroup) {
      const account = await userService.getUserByUserId(userId);

      if (!account) {
        throw new NotFoundError(
          "User not Found. (사용자 조회 실패)",
          "NOT_FOUND",
          {
            userId: "USER_NOT_FOUND",
          }
        );
      }

      const { username, profileImage, intro } = account;

      newAccountGroup.push({
        userId,
        username,
        profileImage,
        intro,
      });
    }

    const { emails, phones } = await userService.getContactsByIdentifier(
      user.userId
    );

    const userInfo = {
      ...userData,
      accountGroup: newAccountGroup,
      emails: emails.map((item) => item.email),
      phones: phones.map((item) => item.phone),
    };

    const display = await displayService.getDisplayByUserId(user.userId);

    const security = await securityService.getSecurityByUserId(user.userId);

    const privacy = await privacyService.getPrivacyByUserId(user.userId);

    const notification = await notificationService.getNotificationByUserId(
      user.userId
    );

    const activeSessions = await activeSessionService.getActiveSessionsByUserId(
      user.userId
    );

    const loginRecords = await loginRecordService.getLoginRecordsByUserId(
      user.userId
    );

    const securityInfo = {
      ...JSON.parse(JSON.stringify(security)),
      activeSessions,
      loginRecords,
    };

    const response = {
      success: true,
      message:
        "Current user info retrieved successfully. (현재 사용자 정보 조회 성공)",
      code: "GET_CURRENT_USER_SUCCEEDED",
      timestamp: new Date().toISOString(),
      data: {
        user: userInfo,
        security: securityInfo,
        privacy,
        notification,
        display,
      },
    };

    res.status(200).json(response);
  }
);

export {
  checkEmailDuplication,
  checkPhoneDuplication,
  checkUserIdDuplication,
  getContactsBeforeLogin,
  getCurrentUser,
};
