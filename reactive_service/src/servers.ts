import type {
  EagerCollection,
  Mapper,
  NonEmptyIterator,
  Resource,
} from "skip-wasm";
import type { InputCollection, ResourcesCollection } from "./social.service.js";
import type { Message } from "./channels.js";
import { MessageMapper } from "./channels.js";
import type { ModifiedProfile } from "./users.js";

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
};

type OutputCollection = {
  serverIndex: EagerCollection<string, boolean>;
  profileServers: EagerCollection<string, ModifiedServer>;
  serverMessages: EagerCollection<string, ModifiedServerMessage>;
  serverMembers: EagerCollection<string, ServerMemberProfile>;
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
    values: NonEmptyIterator<ServerMember>
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
    key: string,
    values: NonEmptyIterator<ServerMember>
  ): Iterable<[string, ModifiedServer]> {
    console.assert(typeof key === "string");
    const value = values.getUnique();
    const server = this.servers.getUnique(value.server_id);
    const channels = this.serverChannels.getArray(value.server_id);
    return [[value.profile_id, { ...server, channels }]];
  }
}

class ServerChannelMapper
  implements Mapper<string, ServerChannel, string, ServerChannel>
{
  mapEntry(
    key: string,
    values: NonEmptyIterator<ServerChannel>
  ): Iterable<[string, ServerChannel]> {
    console.assert(typeof key === "string");
    const value = values.getUnique();
    return [[value.server_id, value]];
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
    values: NonEmptyIterator<ServerMember>
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
    key: string,
    values: NonEmptyIterator<ServerMember>
  ): Iterable<[string, ServerMemberProfile]> {
    console.assert(typeof key === "string");
    const member = values.getUnique();
    const profile = this.modifiedProfiles.getUnique(member.profile_id);
    return [[member.server_id, { ...profile, role: member.role }]];
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
    values: NonEmptyIterator<ServerMemberProfile>
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
      console.log("Checking friendship between", id1, id2);

      const friendKey = `${id1}/${id2}`;
      const isFriend =
        this.friendIndex.getArray(friendKey).length > 0 ? true : false;
      result.push([key, { ...member, friend: isFriend }]);
    }

    return result;
  }
}

// resources

export class ServerMembersIndexResource implements Resource {
  constructor(private params: Record<string, string>) {}

  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, boolean> {
    const profile_id = this.params["profile_id"];
    const server_id = this.params["server_id"];

    if (!profile_id || !server_id) {
      throw new Error("Both profile_id and server_id must be provided");
    }

    const key = `${profile_id}/${server_id}`;
    return collections.friendIndex.slice([key, key]);
  }
}

export class ProfileServersResource implements Resource {
  constructor(private params: Record<string, string>) {}

  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, Server> {
    const profile_id = this.params["profile_id"];
    if (!profile_id) {
      throw new Error("profile_id parameter is required");
    }

    return collections.profileServers.slice([profile_id, profile_id]);
  }
}

export class ServerMessagesResource implements Resource {
  constructor(private params: Record<string, string>) {}

  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, ModifiedServerMessage> {
    const channel_id = this.params["channel_id"];
    if (!channel_id) {
      throw new Error("channel_id parameter is required");
    }

    return collections.serverMessages.slice([channel_id, channel_id]);
  }
}

export class ServerMembersResource implements Resource {
  constructor(private params: Record<string, string>) {}

  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, ServerMemberProfile> {
    const server_id = this.params["server_id"];
    const profile_id = this.params["profile_id"];
    if (!server_id || !profile_id) {
      throw new Error("server_id and profile_id parameters are required");
    }

    return collections.serverMembers
      .slice([server_id, server_id])
      .map(ServerMemberIsFriendMapper, collections.friendIndex, profile_id);
  }
}

// main function

export const createServersCollections = (
  inputCollections: ServersInputCollection
): OutputCollection => {
  const serverChannels =
    inputCollections.serverChannels.map(ServerChannelMapper);
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
  };
};
