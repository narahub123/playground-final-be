const generateAuthCode = (digit: number = 6) => {
  const AuthCode = Math.floor(
    Number(
      (1 + Math.random() * Number("".padStart(digit, "9")))
        .toString()
        .padStart(digit, "0")
    )
  ).toString();

  return AuthCode;
};

export default generateAuthCode;
