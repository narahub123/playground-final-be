import bcrypt from "bcryptjs";

/**
 * 비밀번호와 해시된 비밀번호를 비교하여 일치 여부를 반환하는 함수
 *
 * @param {string} password - 사용자가 입력한 비밀번호
 * @param {string} hashedPassword - 데이터베이스에 저장된 해시된 비밀번호
 * @returns {Promise<boolean>} 비밀번호가 일치하면 `true`, 아니면 `false` 반환
 */
const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    // bcrypt.compare를 사용하여 비밀번호와 해시된 비밀번호를 비교
    const response = await bcrypt.compare(password, hashedPassword);

    // 비교 결과 반환
    return response;
  } catch (error) {
    // 오류 발생 시 콘솔에 에러 로그 출력
    console.error("비밀번호 검증 중 오류 발생", error);

    // 오류 발생 시 false 반환
    return false;
  }
};

export default comparePassword;
