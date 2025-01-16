const generateAuthNumber = (digit: number = 6) => {
  const authNumber = Math.floor(
    Number(
      (1 + Math.random() * Number("".padStart(digit, "9")))
        .toString()
        .padStart(digit, "0")
    )
  ).toString();

  return authNumber;
};

export default generateAuthNumber;
