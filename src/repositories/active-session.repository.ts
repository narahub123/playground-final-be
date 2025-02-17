import { ActiveSession } from "@models";
import { IActiveSession, IDevice, ILocation, UserRoleType } from "@types";
import { mongoDBErrorHandler } from "@utils";

class ActiveSessionRepository {
  /**
   * 주어진 세션 정보를 바탕으로 사용자의 활성 세션을 조회합니다.
   *
   * @param sessionInfo - 세션 정보를 포함한 객체. 사용자의 ID, 디바이스 정보, IP 주소, 위치 정보가 포함됩니다.
   * @returns 활성 세션이 존재하는 경우 해당 세션을 반환하고, 존재하지 않거나 오류가 발생한 경우 `null` 또는 `undefined`를 반환합니다.
   */
  async getActiveSessionByInfo(sessionInfo: {
    userId: string; // 사용자의 고유 ID
    device: IDevice; // 디바이스 정보 (타입, 운영체제, 브라우저)
    ip: string; // 사용자의 IP 주소
    location: ILocation; // 사용자의 위치 정보 (국가, 주, 도시, 카운티)
  }): Promise<IActiveSession | null> {
    try {
      // 세션 정보를 기반으로 MongoDB에서 활성 세션을 찾음
      return await ActiveSession.findOne({
        userId: sessionInfo.userId, // 사용자 ID로 검색
        "device.type": sessionInfo.device.type, // 디바이스 타입으로 검색
        "device.os": sessionInfo.device.os, // 디바이스 운영체제로 검색
        "device.browser": sessionInfo.device.browser, // 디바이스 브라우저로 검색
        ip: sessionInfo.ip, // IP 주소로 검색
        "location.country": sessionInfo.location.country, // 국가로 검색
        "location.state": sessionInfo.location.state, // 주로 검색
        "location.city": sessionInfo.location.city, // 도시로 검색
        "location.county": sessionInfo.location.county, // 카운티로 검색
      });
    } catch (error) {
      // 데이터베이스 오류가 발생한 경우, mongoDBErrorHandler를 통해 오류 처리
      mongoDBErrorHandler("getActiveSessionByInfo", error, sessionInfo);

      // 오류가 발생한 경우 undefined 반환
      return null;
    }
  }

  /**
   * 새로운 활성 세션을 생성합니다.
   *
   * @param sessionInfo - 세션 정보를 포함한 객체. 사용자의 ID, 리프레시 토큰, 디바이스 정보, IP 주소, 위치 정보가 포함됩니다.
   * @returns 생성된 활성 세션 객체를 반환합니다.
   * @throws Error - 데이터베이스에서 세션 생성 중 오류가 발생하면 예외가 발생합니다.
   */
  async createActiveSession(sessionInfo: {
    userId: string; // 사용자의 고유 ID
    userRole: UserRoleType;
    refreshToken: string; // 사용자의 리프레시 토큰
    device: IDevice; // 디바이스 정보 (타입, 운영체제, 브라우저)
    ip: string; // 사용자의 IP 주소
    location: ILocation; // 사용자의 위치 정보 (국가, 주, 도시, 카운티)
  }) {
    // 반환 값: 생성된 활성 세션 객체 또는 오류 발생 시 undefined
    try {
      // 세션 정보를 기반으로 새로운 활성 세션 생성
      const newActiveSession = ActiveSession.create(sessionInfo);

      // 생성된 활성 세션 반환
      return newActiveSession;
    } catch (error) {
      // 데이터베이스 오류 발생 시 에러 핸들러 호출
      mongoDBErrorHandler("createActiveSession", error, sessionInfo);
      return undefined; // 오류 발생 시 undefined 반환
    }
  }

  async getActiveSessionsByUserId(userId: string): Promise<IActiveSession[]> {
    try {
      const activeSessions = await ActiveSession.find({ userId });

      return activeSessions;
    } catch (error) {
      mongoDBErrorHandler("getActiveSessionsByUserId", error, { userId });
      return [];
    }
  }

  async getActiveSessionByRefreshToken(
    refreshToken: string
  ): Promise<IActiveSession | null> {
    try {
      const activeSession = await ActiveSession.findOne({ refreshToken });

      return activeSession;
    } catch (error) {
      mongoDBErrorHandler("getActiveSessionsByUserId", error, { refreshToken });
      return null;
    }
  }
}

export default new ActiveSessionRepository();
