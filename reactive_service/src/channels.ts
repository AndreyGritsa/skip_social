import type {
  EagerCollection,
  Mapper,
  Resource,
  Values,
  Json,
  LazyCollection,
  LazyCompute,
} from "@skipruntime/core";
import type { ResourcesCollection, PostgresCollection } from "./social.service.js";
import type { ModifiedProfile } from "./users.js";
import { GenericSortedMapper } from "./utils/generic.js";
import type { Context } from "@skipruntime/core";

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
  chatCommand: EagerCollection<string, Json>;
};

type ChannelsInputCollection = PostgresCollection & {
  modifiedProfiles: EagerCollection<string, ModifiedProfile>;
  context: Context;
};

// mappers

class ProfileParticipantMapper
  implements Mapper<string, ChannelParticipant, string, string>
{
  mapEntry(
    key: string,
    values: Values<ChannelParticipant>
  ): Iterable<[string, string]> {
    const participants = values.getUnique();
    return [[participants.profile_id, key]];
  }
}

class ChannelProfileMapper
  implements Mapper<string, ChannelParticipant, string, string>
{
  mapEntry(
    _key: string,
    values: Values<ChannelParticipant>
  ): Iterable<[string, string]> {
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
  mapEntry(key: string, values: Values<string>): Iterable<[string, Channel]> {
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
  mapEntry(key: string, values: Values<Channel>): Iterable<[string, Channel]> {
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

export class MessageMapper
  implements Mapper<string, Message, string, ModifiedMessage>
{
  constructor(
    private modifiedProfiles: EagerCollection<string, ModifiedProfile>
  ) {}
  mapEntry(
    _key: string,
    values: Values<Message>
  ): Iterable<[string, ModifiedMessage]> {
    const value: Message = values.getUnique();
    const author = this.modifiedProfiles.getUnique(value.author_id);
    return [
      [
        value.channel_id,
        {
          author: author.name,
          ...value,
        },
      ],
    ];
  }
}

class ComputeChatCommand implements LazyCompute<string, string> {
  constructor(
    private skall: EagerCollection<string, ChannelParticipant>,
    private messages: EagerCollection<string, ModifiedMessage>
  ) {}
  compute(
    _self: LazyCollection<string, string>,
    key: string
  ): Iterable<string> {
    const channelId = this.skall.getUnique(key).channel_id;
    const messages = this.messages.getArray(channelId);
    messages.sort((a, b) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    if (messages.length > 0) {
      const lastMessage = messages[0]!;
      switch (lastMessage.content.toLowerCase()) {
        case "!info":
          return [
            `${
              messages.length
            } messages in this channel, first message was sent at ${
              messages[messages.length - 1]!.created_at
            } by ${messages[messages.length - 1]!.author}`,
          ];
        case "!complex":
          return [this.computeAverageMessageLength(messages)];
        default:
          return ["Unknown command"];
      }
    }
    return [""];
  }

  private computeAverageMessageLength(messages: ModifiedMessage[]): string {
    const totalLength = messages.reduce(
      (sum, message) => sum + message.content.length,
      0
    );
    const averageLength = totalLength / messages.length;
    return `Average message length in this channel: ${averageLength.toFixed(
      2
    )} characters`;
  }
}

class ChatCommandMapper
  implements Mapper<string, ChannelParticipant, string, string>
{
  constructor(
    private evaluator: LazyCollection<string, string>,
    private messages: EagerCollection<string, ModifiedMessage>
  ) {}

  mapEntry(
    key: string,
    values: Values<ChannelParticipant>
  ): Iterable<[string, string]> {
    const participant = values.getUnique();
    let value = "";
    // TODO: DRY
    // TODO: Sort messages earlier
    const messages = this.messages.getArray(participant.channel_id);
    messages.sort((a, b) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    if (messages.length > 0) {
      const lastMessage = messages[0]!;
      if (lastMessage.content.startsWith("!")) {
        value = this.evaluator.getUnique(key);
      }
    }
    return [[participant.channel_id, value]];
  }
}

// resources

export class ChannelsResource implements Resource {
  private profileId: string = "";
  constructor(params: Json) {
    if (typeof params === "string") this.profileId = params;
  }
  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, Channel> {
    if (!this.profileId) {
      throw new Error("profile_id parameter is required");
    }

    return collections.channels.slice(this.profileId, this.profileId);
  }
}

export class MessageResource implements Resource {
  private channelId: string = "";
  constructor(params: Json) {
    if (typeof params === "string") this.channelId = params;
  }
  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, ModifiedMessage> {
    if (!this.channelId) {
      throw new Error("channel_id parameter is required");
    }

    return collections.messages
      .slice(this.channelId, this.channelId)
      .map(GenericSortedMapper<string, ModifiedMessage>)
      .take(20);
  }
}

export class ChannelCommandResource implements Resource {
  private channelId: string = "";
  constructor(params: Json) {
    if (typeof params === "string") this.channelId = params;
  }
  instantiate(collections: ResourcesCollection): EagerCollection<string, Json> {
    if (!this.channelId) {
      throw new Error("channel_id parameter is required");
    }

    return collections.chatCommand.slice(this.channelId, this.channelId);
  }
}

// main function
export const createChannelsCollections = (
  input: ChannelsInputCollection
): OutputCollection => {
  const profileIdParticipantsId = input.channelParticipants.map(
    ProfileParticipantMapper
  );
  const channelIdProfileId =
    input.channelParticipants.map(ChannelProfileMapper);
  const channelsRaw = profileIdParticipantsId.map(
    ChannelMapper,
    input.modifiedProfiles,
    input.channelParticipants,
    channelIdProfileId
  );
  const channels = channelsRaw.map(ChannelNotOneParticipantMapper);
  const messages = input.messages.map(MessageMapper, input.modifiedProfiles);
  // TODO: Should be for chanels instead of participants?
  const lazyChatCommand = input.context.createLazyCollection(
    ComputeChatCommand,
    input.channelParticipants,
    messages
  );
  const chatCommand = input.channelParticipants.map(
    ChatCommandMapper,
    lazyChatCommand,
    messages
  );

  return { channels, messages, chatCommand };
};
