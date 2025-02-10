const extractCountryFromLanguage = (language: string) => {
  return language.split("-")[1] || "KR";
};

export default extractCountryFromLanguage;
