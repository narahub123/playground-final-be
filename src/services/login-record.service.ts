import { IDevice, ILocation, ILoginRecordInput } from "@types";
import { loginRecordRepository } from "@repositories";
import { InternalServerError } from "@errors";

class LoginRecordService {
  /**
   * 새로운 로그인 시도가 있는지 확인하고, 해당 정보를 반환하는 메서드.
   * 사용자의 IP, 기기, 지역을 기존 로그인 기록과 비교하여 새로운 로그인 시도를 탐지하고,
   * 새로운 IP, 기기, 또는 장소에서 로그인 시도가 있었다면 해당 메시지를 반환한다.
   *
   * @param {Object} loginInfo 로그인 시도 정보
   * @param {string} loginInfo.userId 사용자의 ID
   * @param {IDevice} loginInfo.device 로그인 시도에 사용된 기기 정보
   * @param {string} loginInfo.ip 로그인 시도에 사용된 IP 주소
   * @param {ILocation} loginInfo.location 로그인 시도에 사용된 위치 정보
   *
   * @returns {Promise<Record<"newIp" | "newDevice" | "newLocation", boolean>>}
   * - 새로운 IP에서 로그인 시도 시 메시지를 포함하는 객체
   * - 새로운 기기에서 로그인 시도 시 메시지를 포함하는 객체
   * - 새로운 장소에서 로그인 시도 시 메시지를 포함하는 객체
   * - 해당 사항이 없다면, null 값이 포함된 객체 반환
   */
  async detectNewLoginAttempt(loginInfo: {
    userId: string;
    device: IDevice;
    ip: string;
    location: ILocation;
  }): Promise<Record<"newIp" | "newDevice" | "newLocation", boolean>> {
    const { userId, device, ip, location } = loginInfo;

    // 로그인 기록 가져오기
    const loginRecords = await loginRecordRepository.getLoginRecordsByUserId(
      userId
    );

    // 새로운 IP, 기기, 장소 여부를 체크하는 객체 초기화
    const newLoginAttempt: Record<
      "newIp" | "newDevice" | "newLocation",
      boolean
    > = {
      newIp: false,
      newDevice: false,
      newLocation: false,
    };

    // 새로운 IP에서 로그인 시도 여부 확인
    const prevIps = loginRecords.map((record) => record.ip);
    if (!prevIps.includes(ip)) {
      // IP가 새로운 경우 메시지 추가
      newLoginAttempt.newIp = true;
    }

    // 새로운 기기로 로그인 시도 여부 확인
    const prevDevices = loginRecords.map((record) => record.device);
    const isNewDevice = prevDevices.every(
      (prev) =>
        prev?.type !== device.type ||
        prev?.os !== device.os ||
        prev?.browser !== device.browser
    );
    if (isNewDevice) {
      // 기기가 새로운 경우 메시지 추가
      newLoginAttempt.newDevice = true;
    }

    // 새로운 장소에서 로그인 시도 여부 확인
    const prevLocations = loginRecords.map((record) => record.location);
    const isNewLocation = prevLocations.every(
      (prev) =>
        prev?.country !== location.country ||
        prev?.state !== location.state ||
        prev?.city !== location.city
    );
    if (isNewLocation) {
      // 장소가 새로운 경우 메시지 추가
      newLoginAttempt.newLocation = true;
    }

    // 새로운 로그인 시도에 대한 메시지 값을 포함한 객체 반환
    // 해당 사항이 없으면 값이 null로 반환된다.
    return newLoginAttempt;
  }

  /**
   * 로그인 기록을 생성하는 메서드입니다.
   *
   * @param {ILoginRecordInput} loginInfo - 로그인 기록에 필요한 정보를 담고 있는 객체.
   * @throws {InternalServerError} 로그인 기록 저장에 실패한 경우 발생합니다.
   *
   * @returns {Promise<void>} 로그인 기록 생성이 성공하면 void를 반환합니다.
   */
  async createLoginRecord(loginInfo: ILoginRecordInput): Promise<void> {
    // 로그인 기록 생성
    const loginRecord = await loginRecordRepository.createLoginRecord(
      loginInfo
    );

    // 로그인 기록이 생성되지 않은 경우 오류를 던짐
    if (!loginRecord) {
      throw new InternalServerError(
        "Failed to save login record. (로그인 기록 저장에 실패했습니다.)", // 오류 메시지
        "SAVE_FAILED",
        {
          loginRecord: "LOGIN_RECORD_SAVE_FAILED", // 에러 코드
        }
      );
    }
  }
}

export default new LoginRecordService();
