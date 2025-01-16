import {
  EMAIL_SPECIAL_CHARACTERS,
  NUMOFBIRTH,
  USERID_MAX,
  USERID_MIN,
  USERNAME_MAX,
  USERNAME_MIN,
} from "@constants";

const userIdRegExp = new RegExp(`^[a-z0-9_]{${USERID_MIN},${USERID_MAX}}$`);
const usernameRegExp = new RegExp(`^.{${USERNAME_MIN},${USERNAME_MAX}}$`);
const emailRegExp = new RegExp(
  `^[0-9a-zA-Z${EMAIL_SPECIAL_CHARACTERS}]+([.][0-9a-zA-Z${EMAIL_SPECIAL_CHARACTERS}]+)*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\\.[a-zA-Z]{2,}(\\.[a-zA-Z]{2,})?$`
);
const birthRegExp = new RegExp(`^[0-9]{${NUMOFBIRTH}}$`);
const phoneRegExp = new RegExp(
  `^(?:\\+?\\d{1,3}[-\\s]?)?(?:\\(?\\d{1,4}\\)?[-\\s]?)?\\d{1,4}[-\\s]?\\d{1,4}[-\\s]?\\d{1,4}$`
);
const ipRegExp = new RegExp(
  `^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$`
);

export {
  birthRegExp,
  emailRegExp,
  ipRegExp,
  phoneRegExp,
  userIdRegExp,
  usernameRegExp,
};
