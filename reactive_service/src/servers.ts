import type {
  EagerCollection,
  Mapper,
  NonEmptyIterator,
  Resource,
} from "skip-wasm";
import type { InputCollection, ResourcesCollection } from "./social.service.js";

// types

export type ServerMember = {
  server_id: string;
  profile_id: string;
};

type OutputCollection = {
  serverIndex: EagerCollection<string, boolean>;
};

// mappers

export class ServerMemberIndexMapper
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

// main function

export const createServersCollections = (
  inputCollections: InputCollection
): OutputCollection => {
  const serverIndex = inputCollections.serverMembers.map(
    ServerMemberIndexMapper
  );

  return {
    serverIndex,
  };
};
