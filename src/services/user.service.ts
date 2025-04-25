import { InternalServerError, LockedError, NotFoundError } from "@errors";
import {
  IEmail,
  IEmoji,
  IFollowingResponse,
  IPhone,
  IUser,
  LockReasonType,
  SkintoneType,
} from "@types";
import {
  emailRepository,
  phoneRepository,
  userRepository,
} from "@repositories";
import { Types, UpdateResult } from "mongoose";
import mongoose from "mongoose";

class UserService {
  /**
   * 이메일을 통해 해당 사용자 정보를 조회하는 함수.
   * 이메일에 해당하는 정보를 먼저 가져오고, 그 정보를 바탕으로 사용자를 조회합니다.
   *
   * @param {string} email - 조회할 사용자의 이메일 주소.
   * @returns {Promise<IUser | null>} - 사용자 정보 (`IUser` 인터페이스)에 해당하는 데이터를 반환하거나,
   *                                    사용자를 찾을 수 없으면 `null`을 반환.
   * @throws {NotFoundError} - 이메일 정보가 존재하지 않는 경우, `NotFoundError`를 던집니다.
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    // 이메일을 통해 이메일 정보를 조회
    const emailInfo = await emailRepository.getEmailInfoByAddress(email);

    // 이메일 정보가 존재하지 않는 경우, 예외를 던짐
    if (!emailInfo) {
      throw new NotFoundError(
        "Email info is not Found (이메일 정보 조회 실패)",
        "NOT_FOUND",
        {
          email: "EMAIL_INFO_NOT_FOUND", // 오류 세부 정보
        }
      );
    }

    // 이메일 정보를 바탕으로 사용자를 조회
    const user = await userRepository.getUserByUserId(emailInfo.userId);

    // 사용자 정보 반환
    return user;
  }

  /**
   * 전화번호를 통해 해당 사용자의 정보를 조회하는 함수.
   * 전화번호에 해당하는 정보를 먼저 가져오고, 그 정보를 바탕으로 사용자를 조회합니다.
   *
   * @param {string} phone - 조회할 사용자의 전화번호.
   * @returns {Promise<IUser | null>} - 사용자 정보 (`IUser` 인터페이스)에 해당하는 데이터를 반환하거나,
   *                                    사용자를 찾을 수 없으면 `null`을 반환.
   * @throws {NotFoundError} - 전화번호 정보가 존재하지 않는 경우, `NotFoundError`를 던집니다.
   */
  async getUserByPhone(phone: string): Promise<IUser | null> {
    // 전화번호를 통해 전화번호 정보 조회
    const phoneInfo = await phoneRepository.getPhoneInfoByPhone(phone);

    // 전화번호 정보가 존재하지 않는 경우, 예외를 던짐
    if (!phoneInfo) {
      throw new NotFoundError(
        "Phone info is not Found (휴대 전화 번호 정보 조회 실패)",
        "NOT_FOUND",
        {
          email: "PHONE_INFO_NOT_FOUND", // 오류 세부 정보
        }
      );
    }

    // 전화번호 정보를 바탕으로 사용자 정보 조회
    const user = await userRepository.getUserByUserId(phoneInfo.userId);

    // 사용자 정보 반환
    return user;
  }

  async getUserByUserId(userId: string): Promise<IUser | null> {
    const user = await userRepository.getUserByUserId(userId);

    return user;
  }

  async getUserById(userId: Types.ObjectId): Promise<IUser | null> {
    const user = await userRepository.getUserById(userId);

    return user;
  }

  /**
   * 사용자 식별자 (이메일, 전화번호, 사용자 아이디)를 통해 사용자를 조회합니다.
   * @param email - 이메일 (선택적)
   * @param phone - 전화번호 (선택적)
   * @param userId - 사용자 아이디 (선택적)
   * @returns 사용자 정보 (IUser)
   * @throws NotFoundError - 사용자가 존재하지 않을 경우
   */
  async findUserByIdentifier(
    email?: string,
    phone?: string,
    userId?: string
  ): Promise<IUser> {
    let user: IUser | null = null;

    // 이메일을 통해 사용자를 조회
    if (email) {
      user = await this.getUserByEmail(email);
    }
    // 전화번호를 통해 사용자를 조회
    else if (phone) {
      user = await this.getUserByPhone(phone);
    }
    // 사용자 아이디를 통해 사용자를 조회
    else if (userId) {
      user = await userRepository.getUserByUserId(userId);
    }

    // 사용자가 없으면 NotFoundError 던짐
    if (!user) {
      throw new NotFoundError(
        "User is not found (사용자 조회 불가)", // 에러 메시지
        "NOT_FOUND", // 에러 코드
        {
          user: "USER_NOT_FOUND", // 에러 코드
        }
      );
    }

    return user;
  }

  /**
   * 사용자 계정을 잠급니다.
   * 로그인 시도가 비정상적으로 감지되었거나, 로그인 실패 횟수가 초과되었을 경우 계정을 잠급니다.
   *
   * @param userId - 잠금 처리를 할 사용자의 ID
   * @param lockReason - 계정을 잠그는 이유 (예: 비정상적인 로그인 시도, 로그인 실패 횟수 초과 등)
   * @throws {LockedError} 계정 잠금 이유에 해당하는 에러를 던집니다.
   */
  async lockAccount(userId: Types.ObjectId, lockReason: LockReasonType) {
    // 계정 잠금 이유에 따른 에러 메시지를 설정
    const errorMessages: Record<LockReasonType, string> = {
      BRUTE_FORCE_DETECTED:
        "Abnormal login attempts detected, and the account has been locked. (비정상적인 로그인 시도로 인한 계정 잠금)",

      TOO_MANY_LOGIN_FAILURES:
        "The account has been locked due to excessive login attempts. (로그인 횟수 초과로 인한 계정 잠금)",
    };

    // 사용자 계정 잠금 처리
    await userRepository.updateLockStatus(userId, {
      isLocked: true, // 계정 잠금 상태로 설정
      lockReason, // 계정 잠금 사유 설정
      lockedAt: new Date(), // 계정 잠금 시간을 현재 시간으로 설정
    });

    // 잠금 처리 후, 해당 사유에 맞는 LockedError를 던짐
    throw new LockedError(errorMessages[lockReason], "ACCOUNT_LOCK", {
      lock: lockReason,
    });
  }

  /**
   * 주어진 사용자 ID를 통해 이메일과 전화번호 정보를 조회하는 함수.
   *
   * 이메일과 전화번호 정보가 없을 경우, NotFoundError를 던집니다.
   *
   * @param {string} userId - 연락처 정보를 조회할 사용자 ID.
   * @returns {Promise<{ emails: IEmail[]; phones: IPhone[] }>} - 사용자에 해당하는 이메일과 전화번호 배열을 반환.
   * @throws {NotFoundError} - 이메일과 전화번호 정보가 모두 없을 경우 에러를 던집니다.
   */
  async getContactsByIdentifier(
    userId: string
  ): Promise<{ emails: IEmail[]; phones: IPhone[] }> {
    // 사용자 ID로 이메일과 전화번호 정보를 각각 조회합니다.
    const emails = await emailRepository.getEamilsByUserId(userId);
    const phones = await phoneRepository.getPhonesByUserId(userId);

    // 이메일과 전화번호가 모두 없는 경우
    if (emails.length === 0 && phones.length === 0) {
      // 연락처 정보가 없다는 에러를 던집니다.
      throw new NotFoundError(
        "No contact information found for the given user (연락처 조회 불가)",
        "NOT_FOUND",
        {
          userId: "CONTACT_INFO_NOT_FOUND", // 에러에 대한 세부 정보
        }
      );
    }

    // 이메일과 전화번호가 있을 경우 반환합니다.
    return { emails, phones };
  }

  async addAccountGroup(userId: string, newAccountId: string) {
    const result = await userRepository.addAccountGroup(userId, newAccountId);

    if (result && result.matchedCount === 0) {
      // 조건에 맞는 문서가 없을 때
      throw new NotFoundError(
        "The user does not exist. (사용자를 찾을 수 없습니다.)",
        "NOT_FOUND",
        {
          userId: "USER_NOT_FOUND",
        }
      );
    }

    // 만약 성공적으로 업데이트되지 않았다면, 내부 오류로 처리
    if (result && result.modifiedCount === 0) {
      throw new InternalServerError(
        "An error occurred during adding an account. (처리 도중 에러 발생)",
        "INTERNAL_SERVER_ERROR",
        {
          accountGroup: "ADD_ACCOUNT_FAILED",
        }
      );
    }
  }

  async changePassword(userId: string, newPassword: string): Promise<void> {
    const result = await userRepository.changePassword(userId, newPassword);

    if (result && result.matchedCount === 0) {
      // 조건에 맞는 문서가 없을 때
      throw new NotFoundError(
        "The user does not exist. (사용자를 찾을 수 없습니다.)",
        "NOT_FOUND",
        {
          userId: "USER_NOT_FOUND",
        }
      );
    }

    // 만약 성공적으로 업데이트되지 않았다면, 내부 오류로 처리
    if (result && result.modifiedCount === 0) {
      throw new InternalServerError(
        "An error occurred during password change. (비밀번호 변경 도중 에러 발생)",
        "INTERNAL_SERVER_ERROR",
        {
          newPassword: "PASSWORD_CHANGE_FAILED",
        }
      );
    }
  }

  async updateSkintoneType(
    userId: string,
    skintoneType: SkintoneType
  ): Promise<void> {
    const result = await userRepository.updateSkintoneType(
      userId,
      skintoneType
    );

    if (result && result.matchedCount === 0) {
      // 조건에 맞는 문서가 없을 때
      throw new NotFoundError(
        "The user does not exist. (사용자를 찾을 수 없습니다.)",
        "NOT_FOUND",
        {
          userId: "USER_NOT_FOUND",
        }
      );
    }

    // 만약 성공적으로 업데이트되지 않았다면, 내부 오류로 처리
    if (result && result.modifiedCount === 0) {
      throw new InternalServerError(
        "An error occurred during updating skintoneType. (스킨톤 변경 도중 에러 발생)",
        "INTERNAL_SERVER_ERROR",
        {
          skintoneType: "UPDATE_SKINTONE_FAILED",
        }
      );
    }
  }

  async updateRecentEmojis(
    userId: string,
    recentEmojis: IEmoji[]
  ): Promise<void> {
    const result = await userRepository.updateRecentEmojis(
      userId,
      recentEmojis
    );

    if (result && result.matchedCount === 0) {
      // 조건에 맞는 문서가 없을 때
      throw new NotFoundError(
        "The user does not exist. (사용자를 찾을 수 없습니다.)",
        "NOT_FOUND",
        {
          userId: "USER_NOT_FOUND",
        }
      );
    }

    // 만약 성공적으로 업데이트되지 않았다면, 내부 오류로 처리
    if (result && result.modifiedCount === 0) {
      throw new InternalServerError(
        "An error occurred during updating recentEmojis. (최근 이모지 변경 도중 에러 발생)",
        "INTERNAL_SERVER_ERROR",
        {
          skintoneType: "UPDATE_RECENT_EMOJIS_FAILED",
        }
      );
    }
  }

  async updateLikes(userId: Types.ObjectId, postId: Types.ObjectId) {
    const user = await userRepository.getUserById(userId);

    if (!user) {
      throw new NotFoundError("사용자를 찾을 수 없습니다.", "USER_NOT_FOUND");
    }

    const alreadyLike = user.likes.includes(postId);

    const result = alreadyLike
      ? await userRepository.deleteLike(userId, postId)
      : await userRepository.addLike(userId, postId);

    if (!result) {
      throw new InternalServerError("좋아요 업데이트 중 에러 발생");
    }

    if (result.matchedCount === 0) {
      throw new NotFoundError(
        "조건에 맞는 사용자를 찾지 못함",
        "USER_NOT_MATCHED"
      );
    }

    if (result.modifiedCount === 0) {
      throw new InternalServerError("유저의 좋아요 업데이트 실패");
    }

    return alreadyLike ? false : true;
  }

  async isBookmarking(userId: Types.ObjectId, postId: Types.ObjectId) {
    const user = await userRepository.getUserById(userId);

    if (!user) {
      throw new NotFoundError(
        "User not found. (사용자를 찾을 수 없습니다.)",
        "USER_NOT_FOUND",
        {
          userId,
        }
      );
    }

    const bookmarks = user.bookmarks;

    return bookmarks.some((bookmark) => bookmark.equals(postId));
  }

  async updateBookmarks(
    userId: Types.ObjectId,
    postId: Types.ObjectId
  ): Promise<void> {
    const user = await userRepository.getUserById(userId);

    if (!user) {
      throw new NotFoundError(
        "User not found. (사용자를 찾을 수 없습니다.)",
        "USER_NOT_FOUND",
        {
          userId,
        }
      );
    }

    const hasBookmark = user.bookmarks.includes(postId);

    const result = hasBookmark
      ? await userRepository.addBookmark(userId, postId)
      : await userRepository.removeBookmark(userId, postId);

    if (!result || result.matchedCount === 0) {
      throw new InternalServerError("북마크 업데이트 도중 에러 발생");
    }

    if (result.matchedCount === 0) {
      throw new NotFoundError(
        "User not found. (사용자를 찾을 수 없습니다.)",
        "USER_NOT_FOUND",
        {
          userId,
        }
      );
    }
  }

  async updatePinnedPost(
    userId: Types.ObjectId,
    pinnedPost: Types.ObjectId
  ): Promise<void> {
    const user = await userRepository.getUserById(userId);

    if (!user) {
      throw new NotFoundError("사용자 조회 실패");
    }

    const result = user.pinnedPost?.equals(pinnedPost)
      ? await userRepository.removePinnedPost(userId)
      : await userRepository.addPinnedPost(userId, pinnedPost);

    if (!result) {
      throw new InternalServerError("핀포스트 삭제 처리 중 에러 발생");
    }

    if (result.matchedCount === 0) {
      throw new NotFoundError("사용자 조회 실패");
    }

    if (result.modifiedCount === 0) {
      throw new InternalServerError("핀포스트 삭제 처리 중 에러 발생");
    }
  }

  async isFollowing(userId: Types.ObjectId, following: Types.ObjectId) {
    const user = await userRepository.getUserById(userId);

    if (!user) {
      throw new NotFoundError("사용자 조회 실패");
    }

    return user.followings.some((f) => f.user.equals(following));
  }

  async updateFollowingAndFollower(
    userId: Types.ObjectId,
    following: Types.ObjectId
  ): Promise<Types.ObjectId | IFollowingResponse> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const isFollowing = await this.isFollowing(userId, following);

      let response: IFollowingResponse | Types.ObjectId;

      if (isFollowing) {
        // 현재 유저의 following에 상대 유저 삭제
        const unfollowingUser = await userRepository.removeFollowing(
          userId,
          following,
          session
        );

        if (!unfollowingUser) {
          throw new InternalServerError("팔로잉 처리 도중 에러 발생");
        }

        // 상대 유저의 follower에 현재 유저 삭제
        const unfollowedUser = await userRepository.removeFollower(
          following,
          userId,
          session
        );

        if (!unfollowedUser) {
          throw new InternalServerError("팔로우 처리 도중 에러 발생");
        }

        response = following;
      } else {
        const followedAt = new Date();

        // 현재 유저의 following에 상대 유저 추가
        const followingUser = await userRepository.addFollowing(
          userId,
          following,
          followedAt,
          session
        );

        if (!followingUser) {
          throw new InternalServerError("팔로잉 처리 도중 에러 발생");
        }

        // 상대 유저의 follower에 현재 유저 추가
        const followedUser = await userRepository.addFollower(
          following,
          userId,
          followedAt,
          session
        );

        if (!followedUser) {
          throw new InternalServerError("팔로우 처리 도중 에러 발생");
        }

        const { _id, userId: handle, username, profileImage } = followedUser;

        response = {
          _id,
          userId: handle,
          username,
          profileImage,
          followedAt,
        };
      }

      await session.commitTransaction();

      return response;
    } catch (error: any) {
      await session.abortTransaction();
      throw new InternalServerError("팔로잉 처리 중 에러 발생", error);
    } finally {
      session.endSession();
    }
  }
}

export default new UserService();
