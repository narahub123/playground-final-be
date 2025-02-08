export interface UserType {
  password: string;
  userId: string;
  username: string;
  email: string;
  birth: string;
  phone: string[];
  gender: "m" | "f" | "n" | "b";
  userRole: "USER" | "ADMIN";
  country: string;
  language: string;
  ip: string;
  location: string;
  profileImage: string;
  profileCoverImage: string;
  intro: string;
  followings: string[];
  followers: string[];
  mutedUsers: string[];
  blockedUsers: string[];
  isPrivate: boolean;
  isAuthorized: boolean;
  isAutenticated: boolean;
  social: string[];
}

type IsLockedType = {
  status: boolean;
  reason: "BRUTE_FORCE_DETECTED" | "TOO_MANY_LOGIN_FAILURES" | "NONE";
  lockedAt: Date;
};

export type { IsLockedType };
