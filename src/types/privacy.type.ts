type TagTargetType = "all" | "followers";

interface ITaggingSettings {
  allowTagging: boolean;
  tagTarget: TagTargetType;
}

type MessageAllowSettingsType = "all" | "authenticated" | "none";

type MuteTargetType = "all" | "notFollowing";

type MuteDurationType = "forever" | "24h" | "7d" | "30d";

interface IMuteSettings {
  isHomeFeedMuted: boolean;
  isNotificationMuted: boolean;
  muteTarget: MuteTargetType;
  muteDuration: MuteDurationType;
}

interface IPrivacy extends Document {
  userId: string;
  isPostPrivate: boolean;
  isVideoProtected: boolean;
  taggingSettings: ITaggingSettings;
  isSensitiveMediaTagged: boolean;
  isLocationInfoIncluded: boolean;
  isSensitiveMediaDisplayed: boolean;
  topics: string[];
  interests: string[];
  mutedWords: string[];
  muteSettings: IMuteSettings;
  messageAllowSettings: MessageAllowSettingsType;
  isMessageFiltered: boolean;
  isReadReceiptEnabled: boolean;
  isFindableByEmail: boolean;
  isFindableByPhone: boolean;
  contactList: string[];
  isBehavioralAdsAllowed: boolean;
  adAudiences: string[];
  isLocationBasedAdsEnabled: boolean;
  visitedLocations: string[];
}

export type {
  IMuteSettings,
  IPrivacy,
  ITaggingSettings,
  MessageAllowSettingsType,
  MuteDurationType,
  MuteTargetType,
  TagTargetType,
};
