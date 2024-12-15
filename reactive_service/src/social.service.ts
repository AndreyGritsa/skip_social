import type { EagerCollection, SkipService, Entry } from "@skipruntime/api";
import type { User, Profile, ModifiedProfile, FriendRequest } from "./users.js";
import type {
  ServerMember,
  Server,
  ServerChannel,
  ModifiedServer,
  ServerMessage,
  ModifiedServerMessage,
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
} from "./servers.js";
import {
  FriendsResource,
  createUsersCollections,
  OneSideFriendRequestResource,
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
  oneSideFriendRequests: EagerCollection<string, ModifiedProfile>;
  friendsPosts: EagerCollection<string, ModifiedPost>;
  authorPosts: EagerCollection<string, Post>;
  comments: EagerCollection<string, Comment>;
  channels: EagerCollection<string, Channel>;
  messages: EagerCollection<string, ModifiedMessage>;
  profileServers: EagerCollection<string, ModifiedServer>;
  serverMessages: EagerCollection<string, ModifiedServerMessage>;
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
      oneSideFriendRequests: OneSideFriendRequestResource,
      // servers
      serverIndex: ServerMembersIndexResource,
      profileServers: ProfileServersResource,
      serverMessages: ServerMessagesResource,
      // posts
      friendsPosts: FriendsPostsResource,
      authorPosts: AuthorPostsResource,
      comments: CommentsResource,
      // channels
      channels: ChannelsResource,
      messages: MessageResource,
    },
    createGraph: (inputCollections) => {
      const { friends, friendIndex, modifiedProfiles, oneSideFriendRequests } =
        createUsersCollections(inputCollections);
      const { serverIndex, profileServers, serverMessages } =
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
        oneSideFriendRequests,
        friendsPosts,
        authorPosts,
        comments,
        channels,
        messages,
        profileServers,
        serverMessages,
      };
    },
  };
}
