import type {
  Resource,
  EagerCollection,
  Mapper,
  NonEmptyIterator,
} from "skip-wasm";
import type { InputCollection, ResourcesCollection } from "./social.service.js";

// TYPES

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
  oneSideFriendRequests: EagerCollection<string, ModifiedProfile>;
};

// Mappers

export class FriendRequestUniquePhase1Mapper
  implements Mapper<string, FriendRequest, string, FriendRequest>
{
  mapEntry(
    key: string,
    values: NonEmptyIterator<FriendRequest>
  ): Iterable<[string, FriendRequest]> {
    console.assert(typeof key === "string");
    let result: [string, FriendRequest][] = [];
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
    values: NonEmptyIterator<FriendRequest>
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
    key: string,
    values: NonEmptyIterator<FriendRequest>
  ): Iterable<[string, FriendRequest]> {
    console.assert(typeof key === "string");
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
    values: NonEmptyIterator<FriendRequest>
  ): Iterable<[string, boolean]> {
    let array = values.toArray();
    if (array.length >= 2) {
      return [[key, true]];
    }
    return [];
  }
}

class FriendRequestIntersectPhase1Mapper {
  mapEntry(
    key: string,
    values: NonEmptyIterator<FriendRequest>
  ): Iterable<[string, string]> {
    console.log(key);
    let array = values.toArray();
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
    values: NonEmptyIterator<string>
  ): Iterable<[string, ModifiedProfile]> {
    const profile1 = this.modifiedProfiles.getUnique(key);
    const profile2Id = values.getUnique();
    const profile2 = this.modifiedProfiles.getUnique(profile2Id);

    return [
      [key, profile2],
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
    values: NonEmptyIterator<Profile>
  ): Iterable<[string, ModifiedProfile]> {
    const profile = values.getUnique();
    const user = this.users.getUnique(profile.user_id);
    return [[key, { ...profile, name: user.username }]];
  }
}

class OneSideFriendRequestMapper
  implements Mapper<string, FriendRequest, string, ModifiedProfile>
{
  constructor(
    private modifiedProfiles: EagerCollection<string, ModifiedProfile>
  ) {}
  mapEntry(
    key: string,
    values: NonEmptyIterator<FriendRequest>
  ): Iterable<[string, ModifiedProfile]> {
    console.assert(typeof key === "string");
    let array = values.toArray();
    if (array.length === 1) {
      const profile = this.modifiedProfiles.getUnique(
        array[0]!.from_profile_id
      );
      return [[array[0]!.to_profile_id, profile]];
    }
    return [];
  }
}

// Resources

export class FriendsResource implements Resource {
  constructor(private params: Record<string, string>) {}
  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, ModifiedProfile> {
    const id = this.params["profile_id"];
    if (!id) {
      throw new Error("profile_id must be provided");
    }

    return collections.friends.slice([id, id]);
  }
}

export class OneSideFriendRequestResource implements Resource {
  constructor(private params: Record<string, string>) {}
  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, ModifiedProfile> {
    const id = this.params["profile_id"];
    if (!id) {
      throw new Error("profile_id must be provided");
    }

    return collections.oneSideFriendRequests.slice([id, id]);
  }
}

export class ModifiedProfileResource implements Resource {
  constructor(private params: Record<string, string>) {}
  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, ModifiedProfile> {
    const id = this.params["profile_id"];
    if (!id) {
      throw new Error("profile_id must be provided");
    }

    return collections.modifiedProfiles.slice([id, id]);
  }
}

export class FriendsIndexResource implements Resource {
  constructor(private params: Record<string, string>) {}

  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, boolean> {
    let id_1 = this.params["id_1"];
    let id_2 = this.params["id_2"];

    if (!id_1 || !id_2) {
      throw new Error("Both id_1 and id_2 must be provided");
    }

    if (id_1 > id_2) {
      let tmp = id_1;
      id_1 = id_2;
      id_2 = tmp;
    }

    const key = `${id_1}/${id_2}`;
    return collections.friendIndex.slice([key, key]);
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
  const oneSideFriendRequests = friendRequests.map(
    OneSideFriendRequestMapper,
    modifiedProfiles
  );

  return {
    friends,
    friendIndex,
    modifiedProfiles,
    oneSideFriendRequests,
  };
};
