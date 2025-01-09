import {
  fetchUserByUserId,
  fetchUserByEmail,
  fetchUserByPhone,
  checkEmailDuplicate,
  checkUserIdDuplicate,
} from "./user.service";

export {
  fetchUserByUserId,
  fetchUserByEmail,
  fetchUserByPhone,
  checkEmailDuplicate, // 이메일 중복 검사
  checkUserIdDuplicate, // 사용자 아이디 중복 검사
};
