const combineBirth = (year: string, month: string, date: string) => {
  return year + month.padStart(2, "0") + date.padStart(2, "0");
};

export default combineBirth;
