import type {
  EagerCollection,
  SkipService,
  Resource,
  Entry,
  Mapper,
  NonEmptyIterator,
} from "@skipruntime/api";

type User = {
  id: string;
  username: string;
};

type Profile = {
  id: string;
  status: string;
  user_id: string;
};

type ModifiedProfile = Profile & { name: string };

type FriendRequest = {
  id: string;
  from_profile_id: string;
  to_profile_id: string;
};

// type Group = {
//   id: string;
//   name: string;
// };

type GroupMember = {
  group_id: string;
  profile_id: string;
};

type InputCollection = {
  users: EagerCollection<string, User>;
  profiles: EagerCollection<string, Profile>;
  friendRequests: EagerCollection<string, FriendRequest>;
  groupMembers: EagerCollection<string, GroupMember>;
};

type ResourcesCollection = {
  friends: EagerCollection<string, ModifiedProfile>;
  friendIndex: EagerCollection<string, boolean>;
  groupIndex: EagerCollection<string, boolean>;
  modifiedProfiles: EagerCollection<string, ModifiedProfile>;
  oneSideFriendRequests: EagerCollection<string, ModifiedProfile>;
};

export function SocialSkipService(
  users: Entry<string, User>[],
  profiles: Entry<string, Profile>[],
  friendRequests: Entry<string, FriendRequest>[],
  groupMembers: Entry<string, GroupMember>[]
): SkipService<InputCollection, ResourcesCollection> {
  return {
    initialData: { users, profiles, friendRequests, groupMembers },
    resources: {
      friends: FriendsResource,
      friendIndex: FriendsIndexResource,
      groupIndex: GroupMembersIndexResource,
      modifiedProfiles: ModifiedProfileResource,
      oneSideFriendRequests: OneSideFriendRequestResource,
    },
    createGraph: (inputCollections) => {
      const modifiedProfiles = inputCollections.profiles.map(
        ModifiedProfileMapper,
        inputCollections.users
      );
      inputCollections.friendRequests
        .map(FriendRequestUniquePhase1)
        .map(FriendRequestUniquePhase2);
      const friendRequests =
        inputCollections.friendRequests.map(FriendRequestMapper);
      const friendIndex = friendRequests.map(FriendRequestIndex);
      const groupIndex = inputCollections.groupMembers.map(
        GroupMemberIndexMapper
      );
      const friends = friendRequests
        .map(FriendRequestIntersectPhase1)
        .map(FriendRequestIntersectPhase2, modifiedProfiles);
      const oneSideFriendRequests = friendRequests.map(
        OneSideFriendRequestMapper,
        modifiedProfiles
      );

      return {
        friends,
        friendIndex,
        groupIndex,
        modifiedProfiles,
        oneSideFriendRequests,
      };
    },
  };
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
      const profile = this.modifiedProfiles.getUnique(array[0]!.to_profile_id);
      return [[array[0]!.to_profile_id, profile]];
    }
    return [];
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

class FriendRequestIntersectPhase2
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

class OneSideFriendRequestResource implements Resource {
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

class ModifiedProfileResource implements Resource {
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

class FriendsResource implements Resource {
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

class FriendsIndexResource implements Resource {
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

class GroupMembersIndexResource implements Resource {
  constructor(private params: Record<string, string>) {}

  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, boolean> {
    const profile_id = this.params["profile_id"];
    const group_id = this.params["group_id"];

    if (!profile_id || !group_id) {
      throw new Error("Both profile_id and group_id must be provided");
    }

    const key = `${profile_id}/${group_id}`;
    return collections.friendIndex.slice([key, key]);
  }
}

class FriendRequestIntersectPhase1 {
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

class FriendRequestIndex
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

class FriendRequestUniquePhase1
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

class FriendRequestUniquePhase2
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

class GroupMemberIndexMapper
  implements Mapper<string, GroupMember, string, boolean>
{
  mapEntry(
    key: string,
    values: NonEmptyIterator<GroupMember>
  ): Iterable<[string, boolean]> {
    const value = values.getUnique();
    return [[`${value.profile_id}/${key}`, true]];
  }
}
