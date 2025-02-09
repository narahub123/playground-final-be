import { Request, Response } from "express";
import { BadRequestError } from "@errors";
import { asyncWrapper } from "@middlewares";
import {
  createHashedPassword,
  deleteImages,
  generateAuthCode,
  uploadImages,
} from "@utils";
import {
  createUser,
  createUserDisplay,
  createUserNotifications,
  createUserPrivacy,
  createUserSecurity,
  createVerification,
  sendEmail,
} from "@services";
import { UploadApiResponse } from "cloudinary";
import mongoose from "mongoose";

// 사용자 정보 등록
const signupUser = asyncWrapper(
  "signupUser",
  async (req: Request, res: Response) => {
    const { user } = req.body;

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
      location,
      ip,
    } = user;

    // user에 대한 필수 값 확인
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
      notifications.messages === undefined ||
      notifications.replies === undefined ||
      notifications.newFollower === undefined ||
      notifications.posts === undefined
    ) {
      throw new BadRequestError("유저 알림 설정이 제공되어야 합니다.");
    } else if (
      device.type === undefined ||
      device.os === undefined ||
      device.browser === undefined
    ) {
      throw new BadRequestError("기기 정보가 제공되어야 합니다.");
    } else if (
      !location.country ||
      !location.state ||
      !location.city ||
      !location.county
    ) {
      throw new BadRequestError("주소 정보가 제공되어야 합니다.");
    } else if (!ip) {
      throw new BadRequestError("IP 정보가 제공되어야 합니다.");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    let uploadedProfileImage: UploadApiResponse[] = [];

    try {
      // 비밀번호 해싱하기
      const hashedPassword = await createHashedPassword(password);

      // 사진 업로드: 다중 업로드되어 있기 때문에 [0]을 적용해야 함 주의!!!
      uploadedProfileImage = await uploadImages(profileImage);

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
        location,
        profileImage: uploadedProfileImage[0]?.secure_url || "",
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
          posts: notifications.posts,
          messages: notifications.messages,
          replies: notifications.replies ? "all" : "off",
          newFollower: notifications.newFollower,
        },
      };

      await createUser(newUser, { session });

      await createUserSecurity(newSecurity, { session });

      await createUserNotifications(newNotification, { session });

      await createUserDisplay(userId, { session });

      await createUserPrivacy(userId, { session });

      await session.commitTransaction();

      // 인증 이메일 전송하기
      // 인증 번호 생성하기
      const verificationCode = generateAuthCode();

      const subject = "인증코드";
      const html = `<p>인증코드 ${verificationCode}</p>`;

      // 인증 이메일 전송하기
      await sendEmail(email, subject, html);

      // 전송이 되었다면 인증 관련 모델에 저장해야 함
      // 내용 인증 번호, userId, 적정 시간 이내에 인증이 되지 않으면 삭제됨
      await createVerification({ userId, verificationCode });

      res.status(201).json({ success: true });
    } catch (error) {
      if (uploadedProfileImage.length > 0) {
        deleteImages(uploadedProfileImage);
      }
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
);

export { signupUser };
