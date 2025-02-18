import type {
  EagerCollection,
  Mapper,
  Values,
  Resource,
  Json,
} from "@skipruntime/core";
import type { InputCollection, ResourcesCollection } from "./social.service.js";

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
};

type OutputCollection = {
  invites: EagerCollection<string, Invite>;
  ticTacToe: EagerCollection<string, TicTacToe>;
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
  return {
    invites: input.invites.map(InviteMapper),
    ticTacToe: input.ticTacToe,
  };
};
