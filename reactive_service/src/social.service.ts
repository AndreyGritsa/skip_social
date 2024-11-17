type Profile = {
  id: number;
  name: string;
  status: string;
};

type Friend = {
  profile_id: number;
  friend_id: number;
};

type ProfileWithFriends = Profile & { friends: Profile[] };

export default class SocialService implements SkipService {
  initialData: {
    profiles: Entry<string, Profile>[];
    friends: Entry<string, Friend>[];
  };
  resources = { profiles: ProfilesResource };

  constructor(
    profiles: Entry<string, Profile>[],
    friends: Entry<string, Friend>[]
  ) {
    this.initialData = { profiles, friends };
  }

  reactiveCompute(inputCollections: {
    profiles: EagerCollection<number, Profile>;
    friends: EagerCollection<number, Friend>;
  }): Record<string, EagerCollection<TJSON, TJSON>> {
    const friends = inputCollections.friends.map(FriendsMapper);
    const profilesWithFriends = inputCollections.profiles.map(
      ProfilesMapper,
      friends
    );

    return {
      profilesWithFriends,
    };
  }
}

/**
 * Maps a friend's profile ID to the user's profile ID.
 *
 * @param {number} key - The profile ID of the user.
 * @param {NonEmptyIterator<Friend>} values - An iterator of Friend objects where the profile_id matches the key.
 * @returns {Iterable<[number, number]>} An iterable of tuples mapping friend_id to profile_id.
 *
 * Example:
 * profiles = [
 *     { id: 1, name: "Alice", status: "online" },
 *     { id: 2, name: "Bob", status: "away" },
 *     { id: 3, name: "Charlie", status: "online" },
 * ]
 * friends = [
 *     { profile_id: 1, friend_id: 2 },
 *     { profile_id: 1, friend_id: 3 },
 *     { profile_id: 2, friend_id: 1 },
 *     { profile_id: 3, friend_id: 1 },
 * ]
 * Output:
 *     [2, 1], // Bob is a friend of Alice
 *     [3, 1], // Charlie is a friend of Alice
 *     [1, 2], // Alice is a friend of Bob
 *     [1, 3], // Alice is a friend of Charlie
 */
class FriendsMapper {
  mapElement(
    key: number,
    values: NonEmptyIterator<Friend>
  ): Iterable<[number, number]> {
    const value = values.first().friend_id;
    return [[value, key]];
  }
}

/**
 * Maps a profile to include its friends.
 *
 * @param {number} key - The profile ID of the user.
 * @param {NonEmptyIterator<Profile>} values - An iterator of Profile objects where the id matches the key.
 * @returns {Iterable<[number, ProfileWithFriends]>} An iterable of tuples mapping profile_id to ProfileWithFriends.
 *
 * Example:
 * profiles = [
 *     { id: 1, name: "Alice", status: "online" },
 *     { id: 2, name: "Bob", status: "away" },
 *     { id: 3, name: "Charlie", status: "online" },
 * ]
 * friends = [
 *     { profile_id: 1, friend_id: 2 },
 *     { profile_id: 1, friend_id: 3 },
 *     { profile_id: 2, friend_id: 1 },
 *     { profile_id: 3, friend_id: 1 },
 * ]
 * Output:
 *     [
 *       1,
 *       {
 *         id: 1,
 *         name: "Alice",
 *         status: "online",
 *         friends: [
 *           { id: 2, name: "Bob", status: "away" },
 *           { id: 3, name: "Charlie", status: "online" },
 *         ],
 *       },
 *     ]
 */
class ProfilesMapper {
  constructor(private friends: EagerCollection<number, number>) {}

  mapElement(
    key: number,
    values: NonEmptyIterator<Profile>
  ): Iterable<[number, ProfileWithFriends]> {
    // Retrieve the first Profile object from the iterator
    const profile = values.first();

    // Get an array of friend IDs for the profile with the given key (profile ID)
    const friendIds = this.friends.getArray(key);

    // Map each friend ID to a Profile object
    const friends = friendIds.map((id) => this.friends.maybeGetOne(id)!);

    // Return an iterable of tuples mapping the profile ID to the ProfileWithFriends object
    return [[key, { ...profile, friends }]];
  }
}

class ProfilesResource implements Resource {
  reactiveCompute(collections: {
    profilesWithFriends: EagerCollection<number, ProfileWithFriends>;
  }): EagerCollection<number, ProfileWithFriends> {
    return collections.profilesWithFriends;
  }
}
