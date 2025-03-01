import type {
  Resource,
  EagerCollection,
  Mapper,
  Values,
  Json,
} from "@skipruntime/core";
import type { InputCollection, ResourcesCollection } from "./social.service.js";
import { isJsonObject } from "./utils/other.js";

// Types

export type User = {
  id: string;
  username: string;
};

export type Profile = {
  id: string;
  status: string;
  user_id: string;
};

export type ModifiedProfile = Profile & { name: string };

export type FriendRequest = {
  id: string;
  from_profile_id: string;
  to_profile_id: string;
};

type OutputCollection = {
  friends: EagerCollection<string, ModifiedProfile>;
  friendIndex: EagerCollection<string, boolean>;
  modifiedProfiles: EagerCollection<string, ModifiedProfile>;
  friendRequestsTo: EagerCollection<string, ModifiedProfile>;
  friendRequestsFrom: EagerCollection<string, ModifiedProfile>;
  friendRequestsFromTo: EagerCollection<string, FriendRequest>;
};

// Mappers

export class FriendRequestUniquePhase1Mapper
  implements Mapper<string, FriendRequest, string, FriendRequest>
{
  mapEntry(
    _key: string,
    values: Values<FriendRequest>
  ): Iterable<[string, FriendRequest]> {
    const result: [string, FriendRequest][] = [];
    for (const value of values) {
      result.push([`${value.from_profile_id}/${value.to_profile_id}`, value]);
    }
    return result;
  }
}

export class FriendRequestUniquePhase2Mapper
  implements Mapper<string, FriendRequest, string, FriendRequest>
{
  mapEntry(
    key: string,
    values: Values<FriendRequest>
  ): Iterable<[string, FriendRequest]> {
    if (values.toArray().length > 1) {
      throw new Error(`More than one friend requests detected for ${key}`);
    }
    return [];
  }
}

class FriendRequestMapper
  implements Mapper<string, FriendRequest, string, FriendRequest>
{
  mapEntry(
    _key: string,
    values: Values<FriendRequest>
  ): Iterable<[string, FriendRequest]> {
    const result: [string, FriendRequest][] = [];
    for (const value of values) {
      let from = value.from_profile_id;
      let to = value.to_profile_id;
      if (from > to) {
        let tmp = from;
        from = to;
        to = tmp;
      }
      result.push([`${from}/${to}`, value]);
    }
    return result;
  }
}

class FriendRequestIndexMapper
  implements Mapper<string, FriendRequest, string, boolean>
{
  mapEntry(
    key: string,
    values: Values<FriendRequest>
  ): Iterable<[string, boolean]> {
    const array = values.toArray();
    if (array.length >= 2) {
      return [[key, true]];
    }
    return [];
  }
}

class FriendRequestIntersectPhase1Mapper {
  mapEntry(
    _key: string,
    values: Values<FriendRequest>
  ): Iterable<[string, string]> {
    const array = values.toArray();
    if (array.length >= 2) {
      console.assert(array[0]!.from_profile_id === array[1]!.to_profile_id);
      console.assert(array[1]!.from_profile_id === array[0]!.to_profile_id);
      return [[array[0]!.from_profile_id, array[0]!.to_profile_id]];
    }
    return [];
  }
}

class FriendRequestIntersectPhase2Mapper
  implements Mapper<string, string, string, ModifiedProfile>
{
  constructor(
    private modifiedProfiles: EagerCollection<string, ModifiedProfile>
  ) {}

  mapEntry(
    key: string,
    values: Values<string>
  ): Iterable<[string, ModifiedProfile]> {
    const profile1Id = key;
    const profile1 = this.modifiedProfiles.getUnique(profile1Id);
    const profile2Id = values.getUnique();
    const profile2 = this.modifiedProfiles.getUnique(profile2Id);

    return [
      [profile1Id, profile2],
      [profile2Id, profile1],
    ];
  }
}

class ModifiedProfileMapper
  implements Mapper<string, Profile, string, ModifiedProfile>
{
  constructor(private users: EagerCollection<string, User>) {}
  mapEntry(
    key: string,
    values: Values<Profile>
  ): Iterable<[string, ModifiedProfile]> {
    const profile = values.getUnique();
    const user = this.users.getUnique(profile.user_id);
    return [[key, { ...(profile as Profile), name: user.username }]];
  }
}

class FriendRequestToMapper
  implements Mapper<string, FriendRequest, string, ModifiedProfile>
{
  constructor(
    private modifiedProfiles: EagerCollection<string, ModifiedProfile>
  ) {}
  mapEntry(
    _key: string,
    values: Values<FriendRequest>
  ): Iterable<[string, ModifiedProfile]> {
    const array = values.toArray();
    if (array.length === 1) {
      const profile = this.modifiedProfiles.getUnique(
        array[0]!.from_profile_id
      );
      return [[array[0]!.to_profile_id, profile]];
    }
    return [];
  }
}

class FriendRequestFromMapper
  implements Mapper<string, FriendRequest, string, ModifiedProfile>
{
  constructor(
    private modifiedProfiles: EagerCollection<string, ModifiedProfile>
  ) {}
  mapEntry(
    _key: string,
    values: Values<FriendRequest>
  ): Iterable<[string, ModifiedProfile]> {
    const array = values.toArray();
    if (array.length === 1) {
      const profile = this.modifiedProfiles.getUnique(array[0]!.to_profile_id);
      return [[array[0]!.from_profile_id, profile]];
    }
    return [];
  }
}

class FriendRequestFromToMapper
  implements Mapper<string, FriendRequest, string, FriendRequest>
{
  mapEntry(
    _key: string,
    values: Values<FriendRequest>
  ): Iterable<[string, FriendRequest]> {
    const array = values.toArray();
    if (array.length === 1) {
      const friendRequest = array[0]!;
      const newKey = `${friendRequest.from_profile_id}/${friendRequest.to_profile_id}`;
      return [[newKey, friendRequest]];
    } else {
      return [];
    }
  }
}

// Resources
export class FriendsResource implements Resource {
  private profileId: string;

  constructor(params: Json) {
    if (typeof params == "string") this.profileId = params;
    else this.profileId = "";
  }

  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, ModifiedProfile> {
    if (!this.profileId) throw new Error("Profile id should be provided");

    return collections.friends.slice(this.profileId, this.profileId);
  }
}

export class FriendRequestsToResource implements Resource {
  private profileId: string;

  constructor(params: Json) {
    if (typeof params == "string") this.profileId = params;
    else this.profileId = "";
  }
  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, ModifiedProfile> {
    if (!this.profileId) throw new Error("Profile id should be provided");

    return collections.friendRequestsTo.slice(this.profileId, this.profileId);
  }
}

export class FriendRequestsFromResource implements Resource {
  private profileId: string;

  constructor(params: Json) {
    if (typeof params == "string") this.profileId = params;
    else this.profileId = "";
  }
  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, ModifiedProfile> {
    if (!this.profileId) throw new Error("Profile id should be provided");

    return collections.friendRequestsFrom.slice(this.profileId, this.profileId);
  }
}

export class ModifiedProfileResource implements Resource {
  private profileId: string;
  constructor(params: Json) {
    if (typeof params == "string") this.profileId = params;
    else this.profileId = "";
  }

  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, ModifiedProfile> {
    if (!this.profileId) throw new Error("Profile id should be provided");

    return collections.modifiedProfiles.slice(this.profileId, this.profileId);
  }
}

export class FriendsIndexResource implements Resource {
  private id1: string = "";
  private id2: string = "";
  constructor(params: Json) {
    if (
      isJsonObject(params) &&
      typeof params["id_1"] === "string" &&
      typeof params["id_2"] === "string"
    ) {
      this.id1 = params["id_1"];
      this.id2 = params["id_2"];
    }
  }

  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, boolean> {
    if (!this.id1 || !this.id2) {
      throw new Error("Both id_1 and id_2 must be provided");
    }
    let id_1 = this.id1;
    let id_2 = this.id2;

    if (id_1 > id_2) {
      let tmp = id_1;
      id_1 = id_2;
      id_2 = tmp;
    }

    const key = `${id_1}/${id_2}`;
    return collections.friendIndex.slice(key, key);
  }
}

// Main function

export const createUsersCollections = (
  inputCollections: InputCollection
): OutputCollection => {
  const modifiedProfiles = inputCollections.profiles.map(
    ModifiedProfileMapper,
    inputCollections.users
  );
  inputCollections.friendRequests
    .map(FriendRequestUniquePhase1Mapper)
    .map(FriendRequestUniquePhase2Mapper);
  const friendRequests =
    inputCollections.friendRequests.map(FriendRequestMapper);
  const friendIndex = friendRequests.map(FriendRequestIndexMapper);

  const friends = friendRequests
    .map(FriendRequestIntersectPhase1Mapper)
    .map(FriendRequestIntersectPhase2Mapper, modifiedProfiles);
  const friendRequestsTo = friendRequests.map(
    FriendRequestToMapper,
    modifiedProfiles
  );
  const friendRequestsFrom = friendRequests.map(
    FriendRequestFromMapper,
    modifiedProfiles
  );
  const friendRequestsFromTo = friendRequests.map(FriendRequestFromToMapper);

  return {
    friends,
    friendIndex,
    modifiedProfiles,
    friendRequestsTo,
    friendRequestsFrom,
    friendRequestsFromTo,
  };
};
