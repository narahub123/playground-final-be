import { IBirth } from "@types";

const convertBirthToNumber = (birth: IBirth) => {
  return {
    year: Number(birth.year),
    month: Number(birth.month),
    date: Number(birth.date),
  };
};

export default convertBirthToNumber;
