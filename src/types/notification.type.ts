import { Types } from "mongoose";

type RepliesType = "custom" | "all" | "off";
type RepostsType = "custom" | "all" | "off";
type LikesType = "custom" | "all" | "off";
type ReplyMessagesType = "mine" | "all" | "off";
type PopularPostsType = "daily" | "weekly" | "frequently" | "off";

interface INotificationMuteRules {
  isMutedForNotFollowing: boolean;
  isMutedForNotFollower: boolean;
  isMutedForNewAccount: boolean;
  isMutedForDefaultProfile: boolean;
  isMutedForEmailAuthenticated: boolean;
  isMutedForPhoneAuthenticated: boolean;
}

interface IPushNotificationSettings {
  posts: boolean;
  replies: RepliesType;
  reposts: RepostsType;
  likes: LikesType;
  photoTagsEnabled: boolean;
  newFollowersEnabled: boolean;
  messagesEnabled: boolean;
  replyMessages: ReplyMessagesType;
  newContactsJoined: boolean;
  topicsEnabled: boolean;
  newsAndSportsEnabled: boolean;
  recommendationsEnabled: boolean;
  momentsEnabled: boolean;
  liveStreamsEnabled: boolean;
  otherLiveStreamsEnabled: boolean;
  alertsAndUrgentEnabled: boolean;
  professionalUpdatesEnabled: boolean;
}

interface IEmailNotificationSettings {
  newNotificationEnabled: boolean;
  messagesEnabled: boolean;
  postsSentByEmailEnabled: boolean;
  popularPosts: PopularPostsType;
}

interface IEmailSpecialNotifications {
  myStatisticsEnabled: boolean;
  pgUpdatesEnabled: boolean;
  pgTipsEnabled: boolean;
  pgRecentActivityEnabled: boolean;
  pgPartnersEnabled: boolean;
  pgSurveyEnabled: boolean;
  pgRecommendedAccountsEnabled: boolean;
  pgRecentFollowingsEnabled: boolean;
  pgBusinessNewsEnabled: boolean;
}

interface INotification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  isQualityFilterEnabled: boolean;
  isNotificationMuted: boolean;
  notificationMuteRules: INotificationMuteRules;
  isPushNotificationEnabled: boolean;
  pushNotificationSettings: IPushNotificationSettings;
  isEmailNotificationEnabled: boolean;
  emailNotificationSettings: IEmailNotificationSettings;
  emailSpecialNotifications: IEmailSpecialNotifications;
  createdAt: Date;
  updatedAt: Date;
}

interface IPushNotificationInputSettings {
  posts: boolean;
  messagesEnabled: boolean;
  replies: RepliesType;
  newFollowersEnabled: boolean;
}

interface INotificationInput {
  userId: Types.ObjectId;
  pushNotificationSettings: IPushNotificationInputSettings;
}

export type {
  RepliesType,
  RepostsType,
  LikesType,
  ReplyMessagesType,
  PopularPostsType,
  INotificationMuteRules,
  IPushNotificationSettings,
  IEmailNotificationSettings,
  IEmailSpecialNotifications,
  INotification,
  INotificationInput,
  IPushNotificationInputSettings,
};
