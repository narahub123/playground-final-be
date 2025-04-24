import { Types } from "mongoose";

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
  userId: Types.ObjectId;
  isColorContrastEnabled: boolean;
  isMotionReduced: boolean;
  isImageDescriptionAdded: boolean;
  fontSize: FontSizeType;
  colorTheme: ColorThemeType;
  bgTheme: BgThemeType;
  language: string;
  isDataSaverEnabled: boolean;
  isAutoplayEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IDisplayInput {
  userId: Types.ObjectId;
  language: string;
}

export { BgThemeType, ColorThemeType, FontSizeType, IDisplay, IDisplayInput };
