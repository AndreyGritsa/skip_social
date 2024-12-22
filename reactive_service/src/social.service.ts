import type { EagerCollection, SkipService, Entry } from "@skipruntime/api";
import type { User, Profile, ModifiedProfile, FriendRequest } from "./users.js";
import type {
  ServerMember,
  Server,
  ServerChannel,
  ModifiedServer,
  ServerMessage,
  ModifiedServerMessage,
  ServerMemberProfile,
} from "./servers.js";
import type { ModifiedPost, Post, Comment } from "./posts.js";
import type {
  ChannelParticipant,
  Channel,
  Message,
  ModifiedMessage,
} from "./channels.js";
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
} from "./channels.js";

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
  serverMessages: Entry<string, ServerMessage>[]
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
    },
    createGraph: (inputCollections) => {
      const {
        friends,
        friendIndex,
        modifiedProfiles,
        friendRequestsTo,
        friendRequestsFrom,
        friendRequestsFromTo,
      } = createUsersCollections(inputCollections);
      const { serverIndex, profileServers, serverMessages, serverMembers } =
        createServersCollections({
          ...inputCollections,
          modifiedProfiles,
        });
      const { friendsPosts, authorPosts, comments } = createPostsCollections({
        friends,
        ...inputCollections,
        modifiedProfiles,
      });
      const { channels, messages } = createChannelsCollections({
        ...inputCollections,
        modifiedProfiles,
      });

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
      };
    },
  };
}
