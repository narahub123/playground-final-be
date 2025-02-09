type DeviceType = "Web" | "Mobile" | "Tablet"; // PC, 모바일, 태블릿
type OSType = "Windows" | "MacOS" | "Linux" | "Android" | "iOS" | "Unknown"; // 운영 체제
type BrowserType =
  | "Chrome"
  | "Firefox"
  | "Safari"
  | "Edge"
  | "Opera"
  | "Unknown"; // 브라우저

type DeviceInfoType = {
  type: DeviceType;
  os: OSType;
  browser: BrowserType;
};

export type { DeviceInfoType };
