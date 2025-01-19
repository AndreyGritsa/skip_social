import type {
  EagerCollection,
  Mapper,
  Values,
  Resource,
  Json,
} from "@skipruntime/api";
import type { InputCollection, ResourcesCollection } from "./social.service.js";
import type { Message } from "./channels.js";
import { MessageMapper } from "./channels.js";
import type { FriendRequest, ModifiedProfile } from "./users.js";
import { GenericSortedMapper } from "./utils/generic.js";
import { isJsonObject } from "./utils/function.js";

// types
export type Server = {
  id: string;
  name: string;
  owner_id: string;
};

export type ServerChannel = {
  id: string;
  name: string;
  server_id: string;
};

export type ServerChannelWithAllowedRoles = ServerChannel & {
  allowedRoles: ServerChannelAllowedRole[];
};

export type ModifiedServer = Server & { channels: ServerChannel[] };

export type ServerMember = {
  id: string;
  server_id: string;
  profile_id: string;
  role: string;
};

export type ServerMessage = Message;

export type ModifiedServerMessage = ServerMessage & { author: string };

export type ServerMemberProfile = ModifiedProfile & {
  role: string;
  friend?: boolean;
  friendRequested?: boolean;
};

export type ServerChannelAllowedRole = {
  id: string;
  channel_id: string;
  role: string;
};

type OutputCollection = {
  serverIndex: EagerCollection<string, boolean>;
  profileServers: EagerCollection<string, ModifiedServer>;
  serverMessages: EagerCollection<string, ModifiedServerMessage>;
  serverMembers: EagerCollection<string, ServerMemberProfile>;
  serverChannelsAllowedIndexRoles: EagerCollection<string, boolean>;
  serverProfileMember: EagerCollection<string, ServerMemberProfile>;
};

type ServersInputCollection = InputCollection & {
  modifiedProfiles: EagerCollection<string, ModifiedProfile>;
};

// mappers

class ServerMemberIndexMapper
  implements Mapper<string, ServerMember, string, boolean>
{
  mapEntry(
    key: string,
    values: Values<ServerMember>
  ): Iterable<[string, boolean]> {
    const value = values.getUnique();
    return [[`${value.profile_id}/${key}`, true]];
  }
}

class ProfileServerMapper
  implements Mapper<string, ServerMember, string, ModifiedServer>
{
  constructor(
    private servers: EagerCollection<string, Server>,
    private serverChannels: EagerCollection<string, ServerChannel>
  ) {}
  mapEntry(
    _key: string,
    values: Values<ServerMember>
  ): Iterable<[string, ModifiedServer]> {
    const value = values.getUnique();
    const serverArray = this.servers.getArray(value.server_id);
    if (serverArray.length === 0) {
      return [];
    } else {
      const server: Server = serverArray[0]!;
      const channels = this.serverChannels.getArray(value.server_id);
      return [[value.profile_id, { ...server, channels }]];
    }
  }
}

class ServerChannelMapper
  implements
    Mapper<string, ServerChannel, string, ServerChannelWithAllowedRoles>
{
  constructor(
    private serverChannelIdAllowedRoles: EagerCollection<
      string,
      ServerChannelAllowedRole
    >
  ) {}
  mapEntry(
    _key: string,
    values: Values<ServerChannel>
  ): Iterable<[string, ServerChannelWithAllowedRoles]> {
    const value: ServerChannel = values.getUnique();
    const allowedRoles = this.serverChannelIdAllowedRoles.getArray(value.id);

    return [[value.server_id, { ...value, allowedRoles }]];
  }
}

class MemberProfileMapper
  implements Mapper<string, ServerMember, string, ModifiedProfile>
{
  constructor(
    private modifiedProfiles: EagerCollection<string, ModifiedProfile>
  ) {}
  mapEntry(
    key: string,
    values: Values<ServerMember>
  ): Iterable<[string, ModifiedProfile]> {
    const member = values.getUnique();
    const profile = this.modifiedProfiles.getUnique(member.profile_id);
    return [[key, profile]];
  }
}

class ServerMemberMapper
  implements Mapper<string, ServerMember, string, ServerMemberProfile>
{
  constructor(
    private modifiedProfiles: EagerCollection<string, ModifiedProfile>
  ) {}
  mapEntry(
    _key: string,
    values: Values<ServerMember>
  ): Iterable<[string, ServerMemberProfile]> {
    const member = values.getUnique();
    const profile: ModifiedProfile = this.modifiedProfiles.getUnique(
      member.profile_id
    );
    return [[member.server_id, { ...profile, role: member.role }]];
  }
}

class ServerProfileMemberMapper
  implements Mapper<string, ServerMember, string, ServerMemberProfile>
{
  constructor(
    private modifiedProfiles: EagerCollection<string, ModifiedProfile>
  ) {}
  mapEntry(
    _key: string,
    values: Values<ServerMember>
  ): Iterable<[string, ServerMemberProfile]> {
    const member = values.getUnique();
    const profile: ModifiedProfile = this.modifiedProfiles.getUnique(
      member.profile_id
    );
    const newKey = `${member.server_id}/${member.profile_id}`;
    return [[newKey, { ...profile, role: member.role }]];
  }
}

class ServerMemberIsFriendMapper
  implements Mapper<string, ServerMemberProfile, string, ServerMemberProfile>
{
  constructor(
    private friendIndex: EagerCollection<string, boolean>,
    private profileId: string
  ) {}
  mapEntry(
    key: string,
    values: Values<ServerMemberProfile>
  ): Iterable<[string, ServerMemberProfile]> {
    const membersArray = values.toArray();
    const result: [string, ServerMemberProfile][] = [];
    for (const member of membersArray) {
      let id1 = member.id;
      let id2 = this.profileId;

      if (id1 > id2) {
        [id1, id2] = [id2, id1];
      } else if (id1 === id2) {
        result.push([key, member]);
        continue;
      }

      const friendKey = `${id1}/${id2}`;
      const isFriend =
        this.friendIndex.getArray(friendKey).length > 0 ? true : false;
      result.push([
        key,
        { ...(member as ServerMemberProfile), friend: isFriend },
      ]);
    }

    return result;
  }
}

class ServerMemberIsFrienRequestedMapper
  implements Mapper<string, ServerMemberProfile, string, ServerMemberProfile>
{
  constructor(
    private friendRequestsFromTo: EagerCollection<string, FriendRequest>,
    private profileId: string
  ) {}
  mapEntry(
    key: string,
    values: Values<ServerMemberProfile>
  ): Iterable<[string, ServerMemberProfile]> {
    const membersArray = values.toArray();
    const result: [string, ServerMemberProfile][] = [];
    for (const member of membersArray) {
      if (member.friend) {
        result.push([
          key,
          { ...(member as ServerMemberProfile), friendRequested: false },
        ]);
        continue;
      }
      const friendRequested = this.friendRequestsFromTo.getArray(
        `${this.profileId}/${member.id}`
      ).length
        ? true
        : false;
      result.push([
        key,
        { ...(member as ServerMemberProfile), friendRequested },
      ]);
    }

    return result;
  }
}

class ServerChannelAllowedRoleIndexMapper
  implements Mapper<string, ServerChannelAllowedRole, string, boolean>
{
  mapEntry(
    _key: string,
    values: Values<ServerChannelAllowedRole>
  ): Iterable<[string, boolean]> {
    const value = values.getUnique();
    return [[`${value.channel_id}/${value.role}`, true]];
  }
}

class ProfileServersResourceAllowedChannelsMapper
  implements Mapper<string, ModifiedServer, string, ModifiedServer>
{
  constructor(
    private serverChannelAllowedRoles: EagerCollection<string, boolean>,
    private profileId: string,
    private serverProfileMembers: EagerCollection<string, ServerMemberProfile>
  ) {}
  mapEntry(
    key: string,
    values: Values<ModifiedServer>
  ): Iterable<[string, ModifiedServer]> {
    const servers = values.toArray();
    const result: [string, ModifiedServer][] = [];
    for (const server of servers) {
      const allowedChannels: ServerChannel[] = [];
      const serverProfileMember = this.serverProfileMembers.getUnique(
        `${server.id}/${this.profileId}`
      );

      const channels = server.channels;
      // TODO: ask Julien, why can't use .filter?
      for (const channel of channels) {
        const channelKey = `${channel.id}/${serverProfileMember.role}`;
        if (this.serverChannelAllowedRoles.getArray(channelKey).length === 1) {
          allowedChannels.push(channel);
        }
      }
      result.push([
        key,
        { ...(server as ModifiedServer), channels: allowedChannels },
      ]);
    }
    return result;
  }
}

class ServerChannelAllowedRolesMapper
  implements
    Mapper<string, ServerChannelAllowedRole, string, ServerChannelAllowedRole>
{
  mapEntry(
    _key: string,
    values: Values<ServerChannelAllowedRole>
  ): Iterable<[string, ServerChannelAllowedRole]> {
    const value = values.getUnique();
    return [[value.channel_id, value]];
  }
}

// resources

export class ServerMembersIndexResource implements Resource {
  private profileId: string = "";
  private serverId: string = "";
  constructor(params: Json) {
    if (
      isJsonObject(params) &&
      typeof params["profile_id"] === "string" &&
      typeof params["server_id"] === "string"
    ) {
      this.profileId = params["profile_id"];
      this.serverId = params["server_id"];
    }
  }

  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, boolean> {
    if (!this.profileId || !this.serverId) {
      throw new Error("Both profile_id and server_id must be provided");
    }

    const key = `${this.profileId}/${this.serverId}`;
    return collections.friendIndex.slice(key, key);
  }
}

export class ProfileServersResource implements Resource {
  private profileId: string;
  constructor(params: Json) {
    console.log(`test param: ${params}`);
    if (typeof params == "string") this.profileId = params;
    else this.profileId = "";
  }

  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, Server> {
    if (!this.profileId) {
      throw new Error("profile_id parameter is required");
    }

    return collections.profileServers
      .slice(this.profileId, this.profileId)
      .map(
        ProfileServersResourceAllowedChannelsMapper,
        collections.serverChannelsAllowedIndexRoles,
        this.profileId,
        collections.serverProfileMember
      );
  }
}

export class ServerMessagesResource implements Resource {
  private channelId: string;
  constructor(params: Json) {
    console.log(`test param: ${params}`);
    if (typeof params == "string") this.channelId = params;
    else this.channelId = "";
  }

  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, ModifiedServerMessage> {
    if (!this.channelId) {
      throw new Error("channel_id parameter is required");
    }

    return collections.serverMessages
      .slice(this.channelId, this.channelId)
      .map(GenericSortedMapper<string, ModifiedServerMessage>);
  }
}

export class ServerMembersResource implements Resource {
  private serverId: string = "";
  private profileId: string = "";
  constructor(params: Json) {
    if (
      isJsonObject(params) &&
      typeof params["server_id"] === "string" &&
      typeof params["profile_id"] === "string"
    ) {
      this.serverId = params["server_id"];
      this.profileId = params["profile_id"];
    }
  }

  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, ServerMemberProfile> {
    if (!this.serverId || !this.profileId) {
      throw new Error("server_id and profile_id parameters are required");
    }

    return collections.serverMembers
      .slice(this.serverId, this.serverId)
      .map(ServerMemberIsFriendMapper, collections.friendIndex, this.profileId)
      .map(
        ServerMemberIsFrienRequestedMapper,
        collections.friendRequestsFromTo,
        this.profileId
      );
  }
}

// main function

export const createServersCollections = (
  inputCollections: ServersInputCollection
): OutputCollection => {
  const serverChannelsAllowedIndexRoles =
    inputCollections.serverChannelAllowedRoles.map(
      ServerChannelAllowedRoleIndexMapper
    );
  const serverChannelIdAllowedRoles =
    inputCollections.serverChannelAllowedRoles.map(
      ServerChannelAllowedRolesMapper
    );
  const serverProfileMember = inputCollections.serverMembers.map(
    ServerProfileMemberMapper,
    inputCollections.modifiedProfiles
  );
  const serverChannels = inputCollections.serverChannels.map(
    ServerChannelMapper,
    serverChannelIdAllowedRoles
  );
  const serverIndex = inputCollections.serverMembers.map(
    ServerMemberIndexMapper
  );
  const profileServers = inputCollections.serverMembers.map(
    ProfileServerMapper,
    inputCollections.servers,
    serverChannels
  );
  const memberProfiles = inputCollections.serverMembers.map(
    MemberProfileMapper,
    inputCollections.modifiedProfiles
  );
  const serverMessages = inputCollections.serverMessages.map(
    MessageMapper,
    memberProfiles
  );
  const serverMembers = inputCollections.serverMembers.map(
    ServerMemberMapper,
    inputCollections.modifiedProfiles
  );

  return {
    serverIndex,
    profileServers,
    serverMessages,
    serverMembers,
    serverChannelsAllowedIndexRoles,
    serverProfileMember,
  };
};
