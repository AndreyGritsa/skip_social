import type {
  EagerCollection,
  Mapper,
  NonEmptyIterator,
  Resource,
} from "skip-wasm";
import type { InputCollection, ResourcesCollection } from "./social.service.js";
import type { ModifiedProfile } from "./users.js";

// types

export type Channel = {
  id: string;
  participants: ModifiedProfile[];
};

export type ChannelParticipant = {
  id: string;
  channel_id: string;
  profile_id: string;
};

type OutputCollection = {
  channels: EagerCollection<string, Channel>;
};

type ChannelsInputCollection = InputCollection & {
  modifiedProfiles: EagerCollection<string, ModifiedProfile>;
};

// mappers

class ProfileParticipantMapper
  implements Mapper<string, ChannelParticipant, string, string>
{
  mapEntry(
    key: string,
    values: NonEmptyIterator<ChannelParticipant>
  ): Iterable<[string, string]> {
    const participants = values.getUnique();
    console.log(`participants ${participants}`);
    console.log(
      `participants table id ${key}, profile id ${participants.profile_id}`
    );

    return [[participants.profile_id, key]];
  }
}

class ChannelProfileMapper
  implements Mapper<string, ChannelParticipant, string, string>
{
  mapEntry(
    key: string,
    values: NonEmptyIterator<ChannelParticipant>
  ): Iterable<[string, string]> {
    console.assert(typeof key === "string");
    const participants = values.getUnique();
    return [[participants.channel_id, participants.profile_id]];
  }
}

class ChannelMapper implements Mapper<string, string, string, Channel> {
  constructor(
    private modifiedProfiles: EagerCollection<string, ModifiedProfile>,
    private channelParticipants: EagerCollection<string, ChannelParticipant>,
    private channelProfiles: EagerCollection<string, string>
  ) {}
  mapEntry(
    key: string,
    values: NonEmptyIterator<string>
  ): Iterable<[string, Channel]> {
    console.assert(typeof key === "string");
    const value = values.getUnique();
    const participantsArray: ModifiedProfile[] = [];
    const profileId = key;
    const participantTableId = value;
    const channelId =
      this.channelParticipants.getUnique(participantTableId).channel_id;
    const channels = this.channelProfiles.getArray(channelId);

    for (const channel of channels) {
      const id = channel;
      participantsArray.push(this.modifiedProfiles.getUnique(id));
    }
    const result: Channel = {
      id: channelId,
      participants: participantsArray,
    };
    return [[profileId, result]];
  }
}

class ChannelNotOneParticipantMapper
  implements Mapper<string, Channel, string, Channel>
{
  mapEntry(
    key: string,
    values: NonEmptyIterator<Channel>
  ): Iterable<[string, Channel]> {
    const value = values.getUnique();
    if (value.participants.length > 1) {
      return [[key, value]];
    }
    return [];
  }
}

// resources

export class ChannelsResource implements Resource {
  constructor(private params: Record<string, string>) {}
  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, Channel> {
    const profileId = this.params["profile_id"];
    if (profileId === undefined) {
      throw new Error("profile_id parameter is required");
    }

    return collections.channels.slice([profileId, profileId]);
  }
}

// main function
export const createChannelsCollections = (
  inputCollections: ChannelsInputCollection
): OutputCollection => {
  const profileParticipants = inputCollections.channelParticipants.map(
    ProfileParticipantMapper
  );
  const channelProfiles =
    inputCollections.channelParticipants.map(ChannelProfileMapper);
  const channelsRaw = profileParticipants.map(
    ChannelMapper,
    inputCollections.modifiedProfiles,
    inputCollections.channelParticipants,
    channelProfiles
  );
  const channels = channelsRaw.map(ChannelNotOneParticipantMapper);
  return { channels };
};
