import { PostgresExternalService } from "@skip-adapter/postgres";
import type {
  EagerCollection,
  SkipService,
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

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PORT = 5432,
} = process.env;

const postgres = new PostgresExternalService({
  host: POSTGRES_HOST!,
  port: POSTGRES_PORT as number,
  database: POSTGRES_DB!,
  user: POSTGRES_USER!,
  password: POSTGRES_PASSWORD!,
});

export type InputCollection = {
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

export type PostgresCollection = {
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
};

function SocialSkipService(
  initialData: InitialData<InputCollection>
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
      postgres,
      externalAPI: new GenericExternalService({
        weatherAPI: new Polled(
          "https://api.open-meteo.com/v1/forecast",
          45000,
          (data: WeatherResults) => {
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
      const postgresCollections = createPostgresCollection(context);
      const usersCollections = createUsersCollections(postgresCollections);
      const { modifiedProfiles, friends } = usersCollections;
      const serversCollections = createServersCollections({
        ...postgresCollections,
        modifiedProfiles,
      });
      const postsCollections = createPostsCollections({
        friends,
        ...postgresCollections,
        modifiedProfiles,
        context,
      });
      const channelsCollections = createChannelsCollections({
        ...postgresCollections,
        modifiedProfiles,
        context,
      });
      const externalsCollections =
        createExternalsCollections(postgresCollections);
      const gamesCollections = createGamesCollections({
        ...postgresCollections,
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

const createPostgresCollection = (context: Context): PostgresCollection => {
  const serialIDKey = { key: { col: "id", type: "SERIAL" } };

  const createResource = <T extends Json>(identifier: string) =>
    context.useExternalResource<string, T>({
      service: "postgres",
      identifier,
      params: serialIDKey,
    });

  return {
    users: createResource<User>("auth_user"),
    profiles: createResource<Profile>("users_profile"),
    friendRequests: createResource<FriendRequest>("users_friendrequest"),
    serverMembers: createResource<ServerMember>("servers_member"),
    posts: createResource<Post>("posts_post"),
    comments: createResource<Comment>("posts_comment"),
    channelParticipants: createResource<ChannelParticipant>(
      "channels_channel_participants"
    ),
    messages: createResource<Message>("channels_message"),
    servers: createResource<Server>("servers_server"),
    serverChannels: createResource<ServerChannel>("servers_serverchannel"),
    serverMessages: createResource<ServerMessage>(
      "servers_serverchannelmessage"
    ),
    serverChannelAllowedRoles: createResource<ServerChannelAllowedRole>(
      "servers_serverchannelallowedrole"
    ),
    externalServiceSubscriptions: createResource<ExternalServiceSubscription>(
      "externals_externalservicesubscription"
    ),
    replies: createResource<Reply>("posts_reply"),
  };
};

export function main() {
  runService(
    SocialSkipService({
      invites: [],
      ticTacToe: [],
      ticTacToeScores: [],
    })
  );
}
