import type {
  EagerCollection,
  SkipService,
  Entry,
  Context,
  Json,
} from "@skipruntime/core";
import type { User, Profile, ModifiedProfile, FriendRequest } from "./users.js";
import type {
  WeatherResults,
  ExternalServiceSubscription,
  CryptoResults,
} from "./externals.js";
import type {
  ServerMember,
  Server,
  ServerChannel,
  ModifiedServer,
  ServerMessage,
  ModifiedServerMessage,
  ServerMemberProfile,
  ServerChannelAllowedRole,
} from "./servers.js";
import type { ModifiedPost, Post, Comment } from "./posts.js";
import type {
  ChannelParticipant,
  Channel,
  Message,
  ModifiedMessage,
} from "./channels.js";
import { GenericExternalService, Polled } from "@skipruntime/helpers";
import {
  ServerMembersIndexResource,
  createServersCollections,
  ProfileServersResource,
  ServerMessagesResource,
  ServerMembersResource,
} from "./servers.js";
import {
  FriendsResource,
  createUsersCollections,
  FriendRequestsToResource,
  FriendRequestsFromResource,
  ModifiedProfileResource,
  FriendsIndexResource,
} from "./users.js";
import {
  AuthorPostsResource,
  FriendsPostsResource,
  createPostsCollections,
  CommentsResource,
} from "./posts.js";
import {
  createChannelsCollections,
  ChannelsResource,
  MessageResource,
  ChannelCommandResource,
} from "./channels.js";
import {
  WeatherExternalResource,
  createExternalsCollections,
  ExternalServiceSubscriptionsResource,
  cryptoParamEncoder,
  CryptoExternalResource,
} from "./externals.js";

export type InputCollection = {
  users: EagerCollection<string, User>;
  profiles: EagerCollection<string, Profile>;
  friendRequests: EagerCollection<string, FriendRequest>;
  serverMembers: EagerCollection<string, ServerMember>;
  posts: EagerCollection<string, Post>;
  comments: EagerCollection<string, Comment>;
  channelParticipants: EagerCollection<string, ChannelParticipant>;
  messages: EagerCollection<string, Message>;
  servers: EagerCollection<string, Server>;
  serverChannels: EagerCollection<string, ServerChannel>;
  serverMessages: EagerCollection<string, ServerMessage>;
  serverChannelAllowedRoles: EagerCollection<string, ServerChannelAllowedRole>;
  externalServiceSubscriptions: EagerCollection<
    string,
    ExternalServiceSubscription
  >;
};

export type ResourcesCollection = {
  friends: EagerCollection<string, ModifiedProfile>;
  friendIndex: EagerCollection<string, boolean>;
  serverIndex: EagerCollection<string, boolean>;
  modifiedProfiles: EagerCollection<string, ModifiedProfile>;
  friendRequestsTo: EagerCollection<string, ModifiedProfile>;
  friendRequestsFrom: EagerCollection<string, ModifiedProfile>;
  friendRequestsFromTo: EagerCollection<string, FriendRequest>;
  friendsPosts: EagerCollection<string, ModifiedPost>;
  authorPosts: EagerCollection<string, Post>;
  comments: EagerCollection<string, Comment>;
  channels: EagerCollection<string, Channel>;
  messages: EagerCollection<string, ModifiedMessage>;
  profileServers: EagerCollection<string, ModifiedServer>;
  serverMessages: EagerCollection<string, ModifiedServerMessage>;
  serverMembers: EagerCollection<string, ServerMemberProfile>;
  serverChannelsAllowedIndexRoles: EagerCollection<string, boolean>;
  serverProfileMember: EagerCollection<string, ServerMemberProfile>;
  externalServiceSubscriptions: EagerCollection<
    string,
    ExternalServiceSubscription
  >;
  profileExternalServiceSubscriptions: EagerCollection<
    string,
    ExternalServiceSubscription
  >;
  chatCommand: EagerCollection<string, Json>;
};

export function SocialSkipService(
  users: Entry<string, User>[],
  profiles: Entry<string, Profile>[],
  friendRequests: Entry<string, FriendRequest>[],
  serverMembers: Entry<string, ServerMember>[],
  posts: Entry<string, Post>[],
  comments: Entry<string, Comment>[],
  channelParticipants: Entry<string, ChannelParticipant>[],
  messages: Entry<string, Message>[],
  servers: Entry<string, Server>[],
  serverChannels: Entry<string, ServerChannel>[],
  serverMessages: Entry<string, ServerMessage>[],
  serverChannelAllowedRoles: Entry<string, ServerChannelAllowedRole>[],
  externalServiceSubscriptions: Entry<string, ExternalServiceSubscription>[]
): SkipService<InputCollection, ResourcesCollection> {
  return {
    initialData: {
      users,
      profiles,
      friendRequests,
      serverMembers,
      posts,
      comments,
      channelParticipants,
      messages,
      servers,
      serverChannels,
      serverMessages,
      serverChannelAllowedRoles,
      externalServiceSubscriptions,
    },
    resources: {
      // users
      friends: FriendsResource,
      friendIndex: FriendsIndexResource,
      modifiedProfiles: ModifiedProfileResource,
      friendRequestsTo: FriendRequestsToResource,
      friendRequestsFrom: FriendRequestsFromResource,
      // servers
      serverIndex: ServerMembersIndexResource,
      profileServers: ProfileServersResource,
      serverMessages: ServerMessagesResource,
      serverMembers: ServerMembersResource,
      // posts
      friendsPosts: FriendsPostsResource,
      authorPosts: AuthorPostsResource,
      comments: CommentsResource,
      // channels
      channels: ChannelsResource,
      messages: MessageResource,
      channelCommand: ChannelCommandResource,
      // externals
      externals: ExternalServiceSubscriptionsResource,
      weather: WeatherExternalResource,
      crypto: CryptoExternalResource,
    },
    externalServices: {
      externalAPI: new GenericExternalService({
        weatherAPI: new Polled(
          "https://api.open-meteo.com/v1/forecast",
          45000,
          (data: WeatherResults) => {
            // console.log("externalAPI", data);
            if (data) {
              return [[0, [data]]];
            }
            return [];
          }
        ),
        cryptoAPI: new Polled(
          "https://api.coincap.io/v2/assets/",
          45000,
          (data: CryptoResults) => {
            console.log("crypto", data);
            if (data) {
              return [[0, [data]]];
            }
            return [];
          },
          cryptoParamEncoder
        ),
      }),
    },
    createGraph: (inputCollections: InputCollection, context: Context) => {
      const {
        friends,
        friendIndex,
        modifiedProfiles,
        friendRequestsTo,
        friendRequestsFrom,
        friendRequestsFromTo,
      } = createUsersCollections(inputCollections);
      const {
        serverIndex,
        profileServers,
        serverMessages,
        serverMembers,
        serverChannelsAllowedIndexRoles,
        serverProfileMember,
      } = createServersCollections({
        ...inputCollections,
        modifiedProfiles,
      });
      const { friendsPosts, authorPosts, comments } = createPostsCollections({
        friends,
        ...inputCollections,
        modifiedProfiles,
      });
      const { channels, messages, chatCommand } = createChannelsCollections({
        ...inputCollections,
        modifiedProfiles,
        context,
      });
      const {
        profileExternalServiceSubscriptions,
        externalServiceSubscriptions,
      } = createExternalsCollections(inputCollections);

      return {
        friends,
        friendIndex,
        serverIndex,
        modifiedProfiles,
        friendRequestsTo,
        friendRequestsFrom,
        friendRequestsFromTo,
        friendsPosts,
        authorPosts,
        comments,
        channels,
        messages,
        profileServers,
        serverMessages,
        serverMembers,
        serverChannelsAllowedIndexRoles,
        serverProfileMember,
        profileExternalServiceSubscriptions,
        externalServiceSubscriptions,
        chatCommand,
      };
    },
  };
}
