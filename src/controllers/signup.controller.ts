import { Request, Response } from "express";
import { asyncWrapper } from "@middlewares";
import {
  checkEmailDuplicate,
  checkUserIdDuplicate,
  createUser,
  createUserDisplay,
  createUserNotifications,
  createUserPrivacy,
  createUserSecurity,
  fetchUserByUserId,
  sendEmail,
} from "@services";
import { BadRequestError, ConflictError } from "@errors";
import { createHashedPassword, generateAuthNumber, uploadImages } from "@utils";

/**
 * 회원 가입 시 이메일 중복 확인 API 핸들러
 *
 * 이 함수는 사용자가 제공한 이메일이 이미 등록된 이메일인지 확인합니다.
 * 중복된 이메일이 있을 경우, 이를 클라이언트에 알려주는 역할을 합니다.
 *
 * @param {Request} req - Express 요청 객체, 본문에 이메일을 포함해야 합니다.
 * @param {Response} res - Express 응답 객체, 중복 여부를 JSON 형식으로 반환합니다.
 * @throws {BadRequestError} 이메일이 제공되지 않으면 `BadRequestError`를 발생시킵니다.
 * @returns {Object} - 이메일 중복 여부를 포함하는 객체 형식의 응답을 반환합니다.
 *                      예시: `{ isDuplicate: true }` 또는 `{ isDuplicate: false }`
 */
const checkEmailDuplicateInSignup = asyncWrapper(
  "checkEmailDuplicateInSignup",
  async (req: Request, res: Response) => {
    // 요청 본문에서 이메일을 추출합니다.
    const { email } = req.body;

    // 이메일이 제공되지 않았을 경우 BadRequestError를 던집니다.
    if (!email) {
      throw new BadRequestError("이메일을 제공해주세요.");
    }

    // 이메일 중복 체크
    const isDuplicate = await checkEmailDuplicate(email);

    // 중복 여부를 클라이언트에 JSON 형식으로 반환합니다.
    res.status(200).json({ isDuplicate });
  }
);

/**
 * 사용자 아이디 중복 여부를 확인하는 API 엔드포인트
 *
 * @async
 * @function checkUserIdDuplicateInSignup
 * @param {Request} req - 클라이언트의 요청 객체
 * @param {Response} res - 클라이언트에게 반환할 응답 객체
 * @throws {BadRequestError} 사용자 아이디가 제공되지 않은 경우
 * @returns {Promise<void>} 응답으로 중복 여부를 반환하는 Promise
 *
 * @description
 * 이 함수는 클라이언트에서 제공한 사용자 아이디가 이미 등록되어 있는지 확인하고,
 * 중복 여부를 클라이언트에게 반환합니다. 아이디가 제공되지 않으면 `BadRequestError`를 발생시킵니다.
 */
const checkUserIdDuplicateInSignup = asyncWrapper(
  "checkUserIdDuplicateInSignup",
  async (req: Request, res: Response) => {
    // 요청 본문에서 사용자 아이디 추출
    const { userId } = req.body;

    // 사용자 아이디가 제공되지 않은 경우
    if (!userId) {
      throw new BadRequestError("사용자 아이디를 제공해주세요.");
    }

    // 사용자 아이디 중복 체크
    const isDuplicate = await checkUserIdDuplicate(userId);

    // 중복 여부를 클라이언트에게 반환
    res.status(200).json({ isDuplicate });
  }
);

// 사용자 정보 등록
const registerUser = asyncWrapper(
  "registerUser",
  async (req: Request, res: Response) => {
    const { user } = req.body;

    console.log(user);

    const {
      birth,
      email,
      phone,
      language,
      notifications,
      password,
      profileImage,
      userId,
      username,
      device,
      address,
      ip,
    } = user;

    // user에 대한 유효성 검사
    if (!email && !phone) {
      throw new BadRequestError("이메일 혹은 휴대폰이 제공되어야 합니다.");
    } else if (!language) {
      throw new BadRequestError("언어 설정이 제공되어야 합니다.");
    } else if (!password) {
      throw new BadRequestError("비밀번호가 제공되어야 합니다.");
    } else if (!userId) {
      throw new BadRequestError("유저 아이디가 제공되어야 합니다.");
    } else if (!username) {
      throw new BadRequestError("유저 이름이 제공되어야 합니다.");
    } else if (!birth.year || !birth.month || !birth.date) {
      throw new BadRequestError("유저 생년월일이 제공되어야 합니다.");
    } else if (
      notifications.message === undefined ||
      notifications.comment === undefined ||
      notifications.following === undefined ||
      notifications.newPost === undefined
    ) {
      throw new BadRequestError("유저 알림 설정이 제공되어야 합니다.");
    } else if (
      device.type === undefined ||
      device.os === undefined ||
      device.browser === undefined
    ) {
      throw new BadRequestError("기기 정보가 제공되어야 합니다.");
    } else if (
      !address.country ||
      !address.state ||
      !address.city ||
      !address.county
    ) {
      throw new BadRequestError("주소 정보가 제공되어야 합니다.");
    } else if (!ip) {
      throw new BadRequestError("IP 정보가 제공되어야 합니다.");
    }

    // 비밀번호 해싱하기
    const hashedPassword = await createHashedPassword(password);

    // 사진 업로드: 다중 업로드되어 있기 때문에 [0]을 적용해야 함 주의!!!
    const uploadedProfileImage = await uploadImages(profileImage);

    // 생년월일 합치기
    const birthCombined =
      birth.year + birth.month.padStart(2, "0") + birth.date.padStart(2, "0");

    // 국가
    const country = language.split("-")[1];

    const newUser = {
      password: hashedPassword,
      userId,
      username,
      email,
      birth: birthCombined,
      phone,
      // gender, // 어떻게 할 지 아직 안정함
      country, // 생성 여부 결정하기
      language,
      ip,
      location: address,
      profileImage: uploadedProfileImage[0],
    };

    const newSecurity = {
      userId,
      devices: [
        {
          type: device.type,
          os: device.os,
          browser: device.browser,
        },
      ],
    };

    const newNotification = {
      userId,
      pushNotifications: {
        posts: notifications.newPost,
        messages: notifications.message,
        replies: notifications.comment ? "all" : "off",
        newFollower: notifications.following,
      },
    };

    // await createUser(newUser);

    // await createUserSecurity(newSecurity);

    // await createUserNotifications(newNotification);

    // await createUserDisplay(userId);

    // await createUserPrivacy(userId);

    // 인증 이메일 전송하기
    // 인증 번호 생성하기
    const authNumber = generateAuthNumber();

    const subject = "인증코드";
    const html = `<p>인증코드 ${authNumber}</p>`;

    // 인증 이메일 전송하기
    await sendEmail(email, subject, html);

    // 전송이 되었다면 인증 관련 모델에 저장해야 함
    // 내용 인증 번호, userId, 적정 시간 이내에 인증이 되지 않으면 삭제됨
    
  }
);

export {
  checkEmailDuplicateInSignup,
  checkUserIdDuplicateInSignup,
  registerUser,
};
