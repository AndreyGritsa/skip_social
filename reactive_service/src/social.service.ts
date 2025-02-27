import postgres from "postgres";
import type {
  EagerCollection,
  SkipService,
  Entry,
  InitialData,
  Context,
  Json,
} from "@skipruntime/core";
import { runService } from "@skipruntime/server";
import { GenericExternalService, Polled } from "@skipruntime/helpers";
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
import type {
  Invite,
  TicTacToe,
  WinTicTacToe,
  TicTacToeScore,
} from "./games.js";
import type {
  ModifiedPost,
  Post,
  Comment,
  Reply,
  ModifiedReply,
} from "./posts.js";
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
  RepliesResource,
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
import {
  createGamesCollections,
  InvitesResource,
  TicTacToeResource,
} from "./games.js";

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
  replies: EagerCollection<string, Reply>;
  invites: EagerCollection<string, Invite>;
  ticTacToe: EagerCollection<string, TicTacToe>;
  ticTacToeScores: EagerCollection<string, TicTacToeScore>;
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
  replies: EagerCollection<string, ModifiedReply>;
  invites: EagerCollection<string, Invite>;
  ticTacToe: EagerCollection<string, WinTicTacToe>;
};

function SocialSkipService(
  initialData: InitialData<InputCollection>,
): SkipService<InputCollection, ResourcesCollection> {
  return {
    initialData,
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
      replies: RepliesResource,
      // channels
      channels: ChannelsResource,
      messages: MessageResource,
      channelCommand: ChannelCommandResource,
      // externals
      externals: ExternalServiceSubscriptionsResource,
      weather: WeatherExternalResource,
      crypto: CryptoExternalResource,
      // games
      invites: InvitesResource,
      ticTacToe: TicTacToeResource,
    },
    externalServices: {
      externalAPI: new GenericExternalService({
        weatherAPI: new Polled(
          "https://api.open-meteo.com/v1/forecast",
          45000,
          (data: WeatherResults) => {
            if (data) {
              return [[0, [data]]];
            }
            return [];
          },
        ),
        cryptoAPI: new Polled(
          "https://api.coincap.io/v2/assets/",
          45000,
          (data: CryptoResults) => {
            if (data) {
              return [[0, [data]]];
            }
            return [];
          },
          cryptoParamEncoder,
        ),
      }),
    },
    createGraph: (inputCollections: InputCollection, context: Context) => {
      const usersCollections = createUsersCollections(inputCollections);
      const { modifiedProfiles, friends } = usersCollections;
      const serversCollections = createServersCollections({
        ...inputCollections,
        modifiedProfiles,
      });
      const postsCollections = createPostsCollections({
        friends,
        ...inputCollections,
        modifiedProfiles,
        context,
      });
      const channelsCollections = createChannelsCollections({
        ...inputCollections,
        modifiedProfiles,
        context,
      });
      const externalsCollections = createExternalsCollections(inputCollections);
      const gamesCollections = createGamesCollections({
        ...inputCollections,
        modifiedProfiles,
      });

      return {
        ...usersCollections,
        ...serversCollections,
        ...postsCollections,
        ...channelsCollections,
        ...externalsCollections,
        ...gamesCollections,
      };
    },
  };
}

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PORT = "5432",
} = process.env;

const sql = postgres(
  `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`,
);

// `Row` is the type which rows of `table` are ASSUMED to be compatible with
async function selectAll<Row extends Json>(
  table: string,
): Promise<Entry<string, Row>[]> {
  return (await sql`SELECT * FROM ${sql(table)}`).map((r) => {
    if (r["created_at"]) {
      r["created_at"] = r["created_at"].toString();
    }
    return [r["id"], [r as Row]];
  });
}

// Initial values.
const users = await selectAll<User>("auth_user");
const profiles = await selectAll<Profile>("users_profile");
const friendRequests = await selectAll<FriendRequest>("users_friendrequest");
const serverMembers = await selectAll<ServerMember>("servers_member");
const posts = await selectAll<Post>("posts_post");
const comments = await selectAll<Comment>("posts_comment");
const channelParticipants = await selectAll<ChannelParticipant>(
  "channels_channel_participants",
);
const messages = await selectAll<Message>("channels_message");
const servers = await selectAll<Server>("servers_server");
const serverChannels = await selectAll<ServerChannel>("servers_serverchannel");
const serverMessages = await selectAll<Message>("servers_serverchannelmessage");
const serverChannelAllowedRoles = await selectAll<ServerChannelAllowedRole>(
  "servers_serverchannelallowedrole",
);
const externalServiceSubscriptions =
  await selectAll<ExternalServiceSubscription>(
    "externals_externalservicesubscription",
  );
const replies = await selectAll<Reply>("posts_reply");

export function main() {
  runService(
    SocialSkipService({
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
      replies,
      invites: [],
      ticTacToe: [],
      ticTacToeScores: [],
    }),
  );
}
