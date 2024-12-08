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

export type Message = {
  id: string;
  channel_id: string;
  author_id: string;
  created_at: string;
  content: string;
};

export type ModifiedMessage = Message & { author: string };

type OutputCollection = {
  channels: EagerCollection<string, Channel>;
  messages: EagerCollection<string, ModifiedMessage>;
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
    console.log(`ProfileParticipantMapper: ${participants.profile_id}: ${key}`);

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
    private channelIdProfileId: EagerCollection<string, string>
  ) {}
  mapEntry(
    key: string,
    values: NonEmptyIterator<string>
  ): Iterable<[string, Channel]> {
    const result: [string, Channel][] = [];
    const profileId = key;
    const participantTableIds = values.toArray();
    for (const participantTableId of participantTableIds) {
      const participantsArray: ModifiedProfile[] = [];
      const channelId =
        this.channelParticipants.getUnique(participantTableId).channel_id;
      const channels = this.channelIdProfileId.getArray(channelId);

      for (const channel of channels) {
        const id = channel;
        participantsArray.push(this.modifiedProfiles.getUnique(id));
      }
      const channel: Channel = {
        id: channelId,
        participants: participantsArray,
      };
      result.push([profileId, channel]);
    }

    return result;
  }
}

class ChannelNotOneParticipantMapper
  implements Mapper<string, Channel, string, Channel>
{
  mapEntry(
    key: string,
    values: NonEmptyIterator<Channel>
  ): Iterable<[string, Channel]> {
    const result: [string, Channel][] = [];
    const value = values.toArray();
    for (const v of value) {
      if (v.participants.length > 1) {
        result.push([key, v]);
      }
    }
    return result;
  }
}

class MessageMapper
  implements Mapper<string, Message, string, ModifiedMessage>
{
  constructor(
    private modifiedProfiles: EagerCollection<string, ModifiedProfile>
  ) {}
  mapEntry(
    key: string,
    values: NonEmptyIterator<Message>
  ): Iterable<[string, ModifiedMessage]> {
    console.assert(typeof key === "string");
    const value = values.getUnique();

    const author = this.modifiedProfiles.getUnique(value.author_id);
    return [[value.channel_id, { ...value, author: author.name }]];
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

export class MessageResource implements Resource {
  constructor(private params: Record<string, string>) {}
  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, ModifiedMessage> {
    const channelId = this.params["channel_id"];
    if (channelId === undefined) {
      throw new Error("channel_id parameter is required");
    }

    return collections.messages.slice([channelId, channelId]).take(20);
  }
}

// main function
export const createChannelsCollections = (
  inputCollections: ChannelsInputCollection
): OutputCollection => {
  const profileIdParticipantsId = inputCollections.channelParticipants.map(
    ProfileParticipantMapper
  );
  const channelIdProfileId =
    inputCollections.channelParticipants.map(ChannelProfileMapper);
  const channelsRaw = profileIdParticipantsId.map(
    ChannelMapper,
    inputCollections.modifiedProfiles,
    inputCollections.channelParticipants,
    channelIdProfileId
  );
  const channels = channelsRaw.map(ChannelNotOneParticipantMapper);
  const messages = inputCollections.messages.map(
    MessageMapper,
    inputCollections.modifiedProfiles
  );
  return { channels, messages };
};
