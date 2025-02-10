import { IDevice, ILocation } from "@types";
import { comparePassword } from "@utils";
import loginFailureService from "./login-failure.service";
import { UnauthorizedError } from "@errors";

class AuthService {
  /**
   * 주어진 비밀번호를 검증하고, 비밀번호 불일치 시 로그인 실패 기록을 처리하고 계정을 잠금 처리합니다.
   *
   * 이 메서드는 사용자가 입력한 비밀번호와 저장된 비밀번호를 비교하고, 비밀번호가 일치하지 않으면
   * 로그인 실패 기록을 저장하고, 특정 조건에 따라 계정을 잠급니다.
   *
   * @param {string} password - 사용자가 입력한 비밀번호
   * @param {string} savedPassword - 저장된 비밀번호 (해시화된 비밀번호)
   * @param {string} userId - 사용자의 고유 ID
   * @param {IDevice} device - 로그인 시도에 사용된 디바이스 정보
   * @param {string} ip - 로그인 시도에 사용된 IP 주소
   * @param {ILocation} location - 로그인 시도에 사용된 위치 정보
   * @throws {UnauthorizedError} 비밀번호가 일치하지 않으면 예외를 던짐
   */
  async validatePasswordAndHandleLoginFailure(
    password: string,
    savedPassword: string,
    userId: string,
    device: IDevice,
    ip: string,
    location: ILocation
  ): Promise<void> {
    // 비밀번호 검증
    const isValid = await comparePassword(password, savedPassword);

    if (!isValid) {
      // 로그인 실패 기록을 저장하고, 계정 잠금 처리를 함
      await loginFailureService.checkAndLockAccountOnFailure({
        userId,
        device,
        ip,
        location,
      });

      // 비밀번호가 일치하지 않으면 UnauthorizedError 예외를 던짐
      throw new UnauthorizedError(
        "비밀번호가 일치하지 않습니다.",
        "PASSWORD_UNMATCHED"
      );
    }
  }
}

export default new AuthService();
