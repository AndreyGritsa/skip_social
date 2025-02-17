import type {
  EagerCollection,
  Mapper,
  Values,
  Resource,
  Json
} from "@skipruntime/core";
import type { InputCollection, ResourcesCollection } from "./social.service.js";

// types
export type Invite = {
  from_id: string;
  to_id: string;
  status: "pending" | "accepted" | "declined";
  room_id: string;
};

type OutputCollection = {
  invites: EagerCollection<string, Invite>;
};

type GamesInputCollection = InputCollection;

// mappers

class InviteMapper implements Mapper<string, Invite, string, Invite> {
  mapEntry(_key: string, values: Values<Invite>): Iterable<[string, Invite]> {
    const result: [string, Invite][] = [];
    for (const value of values) {
      result.push([`${value.to_id}/${value.status}`, value]);
    }
    return result
    
  }
}

// resources
export class InvitesResource implements Resource {
    private userId: string = "";
      constructor(params: Json) {
        if (typeof params === "string") this.userId = params;
      }
    instantiate(collections: ResourcesCollection): EagerCollection<string, Invite> {
        if (!this.userId) {
            throw new Error("post_id parameter is required");
          }
        const id = `${this.userId}/pending`;
        return collections.invites.slice(id, id);
    }
}

// main function
export const createGamesCollections = (
  input: GamesInputCollection
): OutputCollection => {
  return {
    invites: input.invites.map(InviteMapper),
  };
};
