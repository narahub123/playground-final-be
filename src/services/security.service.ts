import { NotFoundError } from "@errors";
import { securityRepository } from "@repositories";
import { ISecurity } from "@types";

class SecurityService {
  async getSecurityByUserId(userId: string): Promise<ISecurity> {
    const security = await securityRepository.getSecurityByUserId(userId);

    if (security === null) {
      throw new NotFoundError(
        "Security not found. (보안 설정 조회 실패)",
        "NOT_FOUND",
        {
          security: "SECURITY_NOT_FOUND",
        }
      );
    }

    return security;
  }
}

export default new SecurityService();
