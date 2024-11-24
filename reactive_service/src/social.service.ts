import type {
  EagerCollection,
  SkipService,
  Resource,
  Entry,
  Mapper,
  NonEmptyIterator,
} from "@skipruntime/api";

type Profile = {
  id: string;
  name: string;
  status: string;
};

type FriendRequest = {
  id: string;
  friend_id_from: string;
  friend_id_to: string;
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
  profiles: EagerCollection<string, Profile>;
  friendRequests: EagerCollection<string, FriendRequest>;
  groupMembers: EagerCollection<string, GroupMember>;
};

type OutputCollection = {
  friends: EagerCollection<string, string>;
  friendIndex: EagerCollection<string, boolean>;
  groupIndex: EagerCollection<string, boolean>;
};

type FriendIndexCollection = {
  friendIndex: EagerCollection<string, boolean>;
};

// http://service.com/service/friendindex?id_1=1&id_2=2

export function SocialSkipService(
  profiles: Entry<string, Profile>[],
  friendRequests: Entry<string, FriendRequest>[],
  groupMembers: Entry<string, GroupMember>[]
): SkipService<InputCollection, OutputCollection> {
  return {
    initialData: { profiles, friendRequests, groupMembers },
    resources: {
      friends: FriendsResource,
      friendIndex: FriendsIndexResource,
      groupIndex: GroupMembersIndexResource,
    },
    createGraph: (inputCollections) => {
      inputCollections.friendRequests
        .map(FriendRequestUniquePhase1)
        .map(FriendRequestUniquePhase2);
      const friendRequests =
        inputCollections.friendRequests.map(FriendRequestMapper);
      const friendIndex = friendRequests.map(FriendRequestIndex);
      const friends = friendRequests.map(FriendRequestIntersect);

      const groupIndex = inputCollections.groupMembers.map(
        GroupMemberIndexMapper
      );

      return {
        friends,
        friendIndex,
        groupIndex,
      };
    },
  };
}

class FriendsResource implements Resource<OutputCollection> {
  instantiate(collections: OutputCollection): OutputCollection["friends"] {
    return collections.friends;
  }
}

class FriendsIndexResource implements Resource {
  constructor(private params: Record<string, string>) {}

  instantiate(
    collections: FriendIndexCollection
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
    collections: FriendIndexCollection
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

class FriendRequestIntersect {
  mapEntry(
    key: string,
    values: NonEmptyIterator<FriendRequest>
  ): Iterable<[string, string]> {
    console.log(key);
    let array = values.toArray();
    if (array.length >= 2) {
      console.assert(array[0]!.friend_id_from === array[1]!.friend_id_to);
      console.assert(array[1]!.friend_id_from === array[0]!.friend_id_to);
      return [[array[0]!.friend_id_from, array[0]!.friend_id_to]];
    }
    return [];
  }
}

class FriendRequestIndex {
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
    console.log(key);
    let result: [string, FriendRequest][] = [];
    for (const value of values) {
      result.push([`${value.friend_id_from}/${value.friend_id_to}`, value]);
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
    console.log(key);
    if (values.toArray().length > 1) {
      throw new Error("More than one friend requests detected");
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
    console.log(key);
    const result: [string, FriendRequest][] = [];
    for (const value of values) {
      let from = value.friend_id_from;
      let to = value.friend_id_to;
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
