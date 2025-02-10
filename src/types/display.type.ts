// Enum Types
type FontSizeType = "xs" | "s" | "b" | "x" | "xl";

type ColorThemeType =
  | "cornflowerblue"
  | "red"
  | "green"
  | "yellow"
  | "purple"
  | "orange";

type BgThemeType = "light" | "dark" | "darkers";

// Display Schema Type
interface IDisplay extends Document {
  userId: string;
  isColorContrastEnabled: boolean;
  isMotionReduced: boolean;
  isImageDescriptionAdded: boolean;
  fontSize: FontSizeType;
  colorTheme: ColorThemeType;
  bgTheme: BgThemeType;
  isDataSaverEnabled: boolean;
  isAutoplayEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export { BgThemeType, ColorThemeType, FontSizeType, IDisplay };
