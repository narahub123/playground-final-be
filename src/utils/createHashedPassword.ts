import bcrypt from "bcryptjs";

const createHashedPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);

  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
};

export default createHashedPassword;
