import type {
  EagerCollection,
  Resource,
  Context,
  Mapper,
  Values,
  Json,
} from "@skipruntime/core";
import type { InputCollection, ResourcesCollection } from "./social.service.js";
import { isJsonObject } from "./utils/other.js";

// types

export type ExternalServiceSubscription = {
  profile_id: string;
  id: string;
  type: string;
  query_params: Record<string, any>;
};

export type WeatherResults = {
  facts: string[];
  success: boolean;
};

export type CryptoResults = {
  data: {
    id: string;
    rank: string;
    symbol: string;
    name: string;
    supply: string;
    maxSupply: string;
    marketCapUsd: string;
    volumeUsd24Hr: string;
    priceUsd: string;
    changePercent24Hr: string;
    vwap24Hr: string;
    explorer: string;
  };
  timestamp: number;
};

type PostsInputCollection = InputCollection;

type OutputCollection = {
  profileExternalServiceSubscriptions: EagerCollection<
    string,
    ExternalServiceSubscription
  >;
  externalServiceSubscriptions: EagerCollection<
    string,
    ExternalServiceSubscription
  >;
};

// mappers

class ExternalServiceSubscriptionMapper
  implements
    Mapper<
      string,
      ExternalServiceSubscription,
      string,
      ExternalServiceSubscription
    >
{
  mapEntry(
    _key: string,
    values: Values<ExternalServiceSubscription>
  ): Iterable<[string, ExternalServiceSubscription]> {
    const value = values.getUnique();
    return [[value.profile_id, value]];
  }
}

// resources

export class ExternalServiceSubscriptionsResource implements Resource {
  private profileId: string = "";
  constructor(params: Json) {
    if (typeof params === "string") this.profileId = params;
  }
  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, ExternalServiceSubscription> {
    if (!this.profileId) {
      throw new Error("profile_id parameter is required");
    }
    return collections.profileExternalServiceSubscriptions.slice(
      this.profileId,
      this.profileId
    );
  }
}

export class WeatherExternalResource implements Resource {
  private id: string = "";
  constructor(params: Json) {
    if (typeof params === "string") this.id = params;
  }
  instantiate(
    collections: ResourcesCollection,
    context: Context
  ): EagerCollection<string, WeatherResults> {
    if (!this.id) {
      throw new Error("id parameter is required");
    }
    let query_params = {};
    const subcriptionArray = collections.externalServiceSubscriptions.getArray(
      this.id
    );

    if (subcriptionArray && subcriptionArray.length > 0) {
      query_params = subcriptionArray[0]!.query_params;
    }
    return context.useExternalResource<string, WeatherResults>({
      service: "externalAPI",
      identifier: "weatherAPI",
      params: query_params,
    });
  }
}

// TODO: implement generic one
export class CryptoExternalResource implements Resource {
  private id: string = "";
  constructor(params: Json) {
    if (typeof params === "string") this.id = params;
  }
  instantiate(
    collections: ResourcesCollection,
    context: Context
  ): EagerCollection<string, CryptoResults> {
    if (!this.id) {
      throw new Error("id parameter is required");
    }
    let query_params = {};
    const subcriptionArray = collections.externalServiceSubscriptions.getArray(
      this.id
    );

    if (subcriptionArray && subcriptionArray.length > 0) {
      query_params = subcriptionArray[0]!.query_params;
    }
    // TODO: move usage of useExternalResource
    // to createGraph and map the results there properly
    // to avoid unnecessary connections.
    // WHEN useExternalResource could be used in a map
    return context.useExternalResource<string, CryptoResults>({
      service: "externalAPI",
      identifier: "cryptoAPI",
      params: query_params,
    });
  }
}
// main function

export const createExternalsCollections = (
  inputCollections: PostsInputCollection
): OutputCollection => {
  const profileExternalServiceSubscriptions =
    inputCollections.externalServiceSubscriptions.map(
      ExternalServiceSubscriptionMapper
    );

  return {
    profileExternalServiceSubscriptions,
    externalServiceSubscriptions: inputCollections.externalServiceSubscriptions,
  };
};

// other

export const cryptoParamEncoder = (params: Json): string => {
  if (isJsonObject(params) && params["url"]) return params["url"] as string;
  else return "";
};
