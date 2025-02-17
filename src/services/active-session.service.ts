import { InternalServerError, NotFoundError } from "@errors";
import { IActiveSession, IDevice, ILocation, UserRoleType } from "@types";
import { activeSessionRepository } from "@repositories";
import { createAccessToken, createRefreshToken } from "@utils";
import { ACCESSTOKEN_EXPIRES, REFRESHTOKEN_EXPIRES } from "@constants";

class ActiveSessionService {
  /**
   * 주어진 세션 정보로 활성 세션이 존재하는지 확인합니다.
   *
   * @param sessionInfo - 세션 정보를 포함한 객체. 사용자의 ID, 디바이스 정보, IP 주소, 위치 정보가 포함됩니다.
   * @returns 활성 세션이 존재하면 `true`, 존재하지 않으면 `false`를 반환합니다.
   */
  async checkExistingActiveSession(sessionInfo: {
    userId: string; // 사용자의 고유 ID
    device: IDevice; // 디바이스 정보 (타입, 운영체제, 브라우저)
    ip: string; // 사용자의 IP 주소
    location: ILocation; // 사용자의 위치 정보 (국가, 주, 도시, 카운티)
  }): Promise<boolean> {
    // 반환 값: 활성 세션 존재 여부를 나타내는 boolean 값
    // 세션 정보를 기반으로 활성 세션 조회
    const existingSession =
      await activeSessionRepository.getActiveSessionByInfo(sessionInfo);

    // 세션이 존재하면 true, 없으면 false 반환
    return !!existingSession;
  }

  /**
   * 새로운 활성 세션을 생성하고, 리프레시 토큰 및 액세스 토큰을 발급합니다.
   *
   * @param info - 세션 생성 및 토큰 발급에 필요한 정보 객체
   * @param info.userId - 사용자의 고유 ID
   * @param info.device - 사용자의 디바이스 정보 (타입, 운영체제, 브라우저)
   * @param info.ip - 사용자의 IP 주소
   * @param info.location - 사용자의 위치 정보 (국가, 주, 도시, 카운티)
   * @param info.userRole - 사용자의 역할 (예: 'admin', 'user' 등)
   *
   * @returns 생성된 리프레시 토큰과 액세스 토큰을 포함하는 객체를 반환합니다.
   * @throws CustomAPIError - active session 생성 실패 시 오류를 던집니다.
   */
  async createSessionAndIssueTokens(info: {
    userId: string; // 사용자의 고유 ID
    device: IDevice; // 디바이스 정보 (타입, 운영체제, 브라우저)
    ip: string; // 사용자의 IP 주소
    location: ILocation; // 사용자의 위치 정보 (국가, 주, 도시, 카운티)
    userRole: UserRoleType; // 사용자의 역할 (예: 'admin', 'user' 등)
  }): Promise<{ refreshToken: string; accessToken: string }> {
    // 반환 값: 리프레시 토큰과 액세스 토큰 객체
    const { userId, device, ip, location, userRole } = info;

    // refresh 토큰 생성
    const refreshToken = createRefreshToken(
      userId,
      Number(process.env.REFRESHTOKEN_EXPIRES) || REFRESHTOKEN_EXPIRES
    );

    // 세션 정보 객체 생성
    const sessionInfo = {
      userId,
      userRole,
      refreshToken,
      device,
      ip,
      location,
    };

    // active session 생성
    const activeSession = await activeSessionRepository.createActiveSession(
      sessionInfo
    );

    // active session 생성 실패 시 에러 발생
    if (!activeSession) {
      throw new InternalServerError(
        "Failed to create active session. (활성 세션 생성 실패)",
        "SESSION_ERROR",
        {
          session: "SESSION_CREATION_FAILED",
        }
      );
    }

    // access 토큰 생성
    const accessToken = createAccessToken(
      activeSession._id,
      userId,
      userRole,
      Number(process.env.ACESSTOKEN_EXPIRES) || ACCESSTOKEN_EXPIRES
    );

    // 리프레시 토큰과 액세스 토큰을 반환
    return { refreshToken, accessToken };
  }

  async getActiveSessionsByUserId(userId: string): Promise<IActiveSession[]> {
    const activeSessions =
      await activeSessionRepository.getActiveSessionsByUserId(userId);

    if (activeSessions.length === 0) {
      throw new NotFoundError(
        "Active session not found. (활성 세션 조회 실패)",
        "NOT_FOUND",
        {
          activeSession: "ACTIVE_SESSION_NOT_FOUND",
        }
      );
    }

    return activeSessions;
  }

  async getActiveSessionByRefreshToken(
    refreshToken: string
  ): Promise<IActiveSession | null> {
    const activeSession =
      await activeSessionRepository.getActiveSessionByRefreshToken(
        refreshToken
      );

    return activeSession;
  }

  // refresh 토큰으로 활성 섹션 삭제하기
  async deleteActiveSessionByRefreshToken(refreshToken: string) {
    const activeSession =
      await activeSessionRepository.deleteActiveSessionByRefreshToken(
        refreshToken
      );

    if (activeSession === null) {
      throw new NotFoundError(
        "Active session not found. (활성 세션을 찾을 수 없음)",
        "NOT_FOUND",
        { refreshToken: "ACTIVE_SESSION_NOT_FOUND" }
      );
    }
  }
}

export default new ActiveSessionService();
