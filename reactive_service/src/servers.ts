import type {
  EagerCollection,
  Mapper,
  NonEmptyIterator,
  Resource,
} from "skip-wasm";
import type { InputCollection, ResourcesCollection } from "./social.service.js";

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

type OutputCollection = {
  serverIndex: EagerCollection<string, boolean>;
  profileServers: EagerCollection<string, ModifiedServer>;
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

// main function

export const createServersCollections = (
  inputCollections: InputCollection
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

  return {
    serverIndex,
    profileServers,
  };
};
