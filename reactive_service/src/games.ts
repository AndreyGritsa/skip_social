import type {
  EagerCollection,
  Mapper,
  Values,
  Resource,
  Json,
} from "@skipruntime/core";
import type { InputCollection, ResourcesCollection } from "./social.service.js";

const winningCombos = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
  [1, 5, 9],
  [3, 5, 7],
];

// types
export type Invite = {
  from_id: string;
  to_id: string;
  status: "pending" | "accepted" | "declined";
  room_id: string;
};

export type TicTacToe = {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  room_id: string;
  last_move: string;
  [key: string]: string | number[];
};

export type WinTicTacToe = TicTacToe & { winning_combo: number[] };

type OutputCollection = {
  invites: EagerCollection<string, Invite>;
  ticTacToe: EagerCollection<string, WinTicTacToe>;
};

type GamesInputCollection = InputCollection;

// mappers

class InviteMapper implements Mapper<string, Invite, string, Invite> {
  mapEntry(_key: string, values: Values<Invite>): Iterable<[string, Invite]> {
    const result: [string, Invite][] = [];
    for (const value of values) {
      result.push([`${value.to_id}/${value.status}`, value]);
    }
    return result;
  }
}

class RoomIdInvitesMapper implements Mapper<string, Invite, string, Invite> {
  mapEntry(_key: string, values: Values<Invite>): Iterable<[string, Invite]> {
    const value = values.getUnique();
    return [[value.room_id, value]];
  }
}

class TicTacToeMapper implements Mapper<string, TicTacToe, string, TicTacToe> {
  constructor(private roomIdInvites: EagerCollection<string, Invite>) {}
  mapEntry(
    key: string,
    values: Values<TicTacToe>
  ): Iterable<[string, TicTacToe]> {
    const value = values.getUnique();
    const invite = this.roomIdInvites.getUnique(value.room_id);
    const from_id = `${invite.from_id}_`;
    const to_id = `${invite.to_id}_`;
    return [[key, { ...(value as TicTacToe), [from_id]: "X", [to_id]: "O" }]];
  }
}

class WinTicTacToeMapper
  implements Mapper<string, TicTacToe, string, WinTicTacToe>
{
  mapEntry(
    key: string,
    values: Values<TicTacToe>
  ): Iterable<[string, WinTicTacToe]> {
    const value = values.getUnique();
    const winning_combo = winningCombos.find((combo) => {
      const [a, b, c] = combo;
      return value[a!] && value[a!] === value[b!] && value[b!] === value[c!];
    });
    return [
      [key, { ...(value as TicTacToe), winning_combo: winning_combo || [] }],
    ];
  }
}

// resources
export class InvitesResource implements Resource {
  private userId: string = "";
  constructor(params: Json) {
    if (typeof params === "string") this.userId = params;
  }
  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, Invite> {
    if (!this.userId) {
      throw new Error("post_id parameter is required");
    }
    const id = `${this.userId}/pending`;
    return collections.invites.slice(id, id);
  }
}

export class TicTacToeResource implements Resource {
  private roomId: string = "";
  constructor(params: Json) {
    if (typeof params === "string") this.roomId = params;
  }
  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, TicTacToe> {
    if (!this.roomId) {
      throw new Error("post_id parameter is required");
    }
    return collections.ticTacToe.slice(this.roomId, this.roomId);
  }
}

// main function
export const createGamesCollections = (
  input: GamesInputCollection
): OutputCollection => {
  const roomIdInvites = input.invites.map(RoomIdInvitesMapper);
  return {
    invites: input.invites.map(InviteMapper),
    ticTacToe: input.ticTacToe
      .map(TicTacToeMapper, roomIdInvites)
      .map(WinTicTacToeMapper),
  };
};
