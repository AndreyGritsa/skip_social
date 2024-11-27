import type { EagerCollection, SkipService, Entry } from "@skipruntime/api";
import type { User, Profile, ModifiedProfile, FriendRequest } from "./users.js";
import type { ServerMember } from "./servers.js";
import {
  ServerMembersIndexResource,
  createServersCollections,
} from "./servers.js";
import {
  FriendsResource,
  createUsersCollections,
  OneSideFriendRequestResource,
  ModifiedProfileResource,
  FriendsIndexResource,
} from "./users.js";

export type InputCollection = {
  users: EagerCollection<string, User>;
  profiles: EagerCollection<string, Profile>;
  friendRequests: EagerCollection<string, FriendRequest>;
  serverMembers: EagerCollection<string, ServerMember>;
};

export type ResourcesCollection = {
  friends: EagerCollection<string, ModifiedProfile>;
  friendIndex: EagerCollection<string, boolean>;
  serverIndex: EagerCollection<string, boolean>;
  modifiedProfiles: EagerCollection<string, ModifiedProfile>;
  oneSideFriendRequests: EagerCollection<string, ModifiedProfile>;
};

export function SocialSkipService(
  users: Entry<string, User>[],
  profiles: Entry<string, Profile>[],
  friendRequests: Entry<string, FriendRequest>[],
  serverMembers: Entry<string, ServerMember>[]
): SkipService<InputCollection, ResourcesCollection> {
  return {
    initialData: { users, profiles, friendRequests, serverMembers },
    resources: {
      // users
      friends: FriendsResource,
      friendIndex: FriendsIndexResource,
      modifiedProfiles: ModifiedProfileResource,
      oneSideFriendRequests: OneSideFriendRequestResource,
      // servers
      serverIndex: ServerMembersIndexResource,
    },
    createGraph: (inputCollections) => {
      const { friends, friendIndex, modifiedProfiles, oneSideFriendRequests } =
        createUsersCollections(inputCollections);
      const { serverIndex } = createServersCollections(inputCollections);

      return {
        friends,
        friendIndex,
        serverIndex,
        modifiedProfiles,
        oneSideFriendRequests,
      };
    },
  };
}
