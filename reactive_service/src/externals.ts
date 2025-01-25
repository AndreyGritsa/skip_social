import type {
  EagerCollection,
  Resource,
  Context,
  Mapper,
  Values,
  Json,
  Entry,
} from "@skipruntime/api";
import type { ExternalResource } from "@skipruntime/helpers";
import { fetchJSON } from "@skipruntime/helpers";
import type { InputCollection, ResourcesCollection } from "./social.service.js";

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
    console.log(
      `external service subscription queryparams: ${value.query_params}, profile_id: ${value.profile_id}`
    );

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

// custom Polled
type ParamsWithUrl = { url: string } & Json;

function defaultParamEncoder(params: Json): string {
  if (typeof params == "object") {
    const queryParams: { [param: string]: string } = {};
    for (const [key, value] of Object.entries(params)) {
      if (typeof value == "object") queryParams[key] = JSON.stringify(value);
      else queryParams[key] = value.toString();
    }
    return new URLSearchParams(queryParams).toString();
  } else return `params=${JSON.stringify(params)}`;
}

type Timeout = ReturnType<typeof setInterval>;

export class CustomPolled<S extends Json, K extends Json, V extends Json>
  implements ExternalResource
{
  private readonly intervals = new Map<string, Timeout>();

  /**
   * @param url - HTTP endpoint of external resource to poll.
   * @param duration - Refresh interval, in milliseconds.
   * @param conv - Function to convert data of type `S` received from external resource to `key`-`value` entries.
   * @param encodeParams - Function to use to encode params of type `Json` for external resource request.
   */
  constructor(
    private readonly url: string,
    private readonly duration: number,
    private readonly conv: (data: S) => Entry<K, V>[],
    private readonly encodeParams: (
      params: ParamsWithUrl
    ) => string = defaultParamEncoder
  ) {}

  open(
    params: ParamsWithUrl,
    callbacks: {
      update: (updates: Entry<Json, Json>[], isInit: boolean) => void;
      error: (error: Json) => void;
      loading: () => void;
    }
  ): void {
    this.close(params);
    console.assert(typeof this.url === "string");
    const url = `${params.url}?${this.encodeParams(params)}`;
    const call = () => {
      callbacks.loading();
      fetchJSON(url, "GET", {})
        .then((r) => {
          callbacks.update(this.conv(r[0] as S), true);
        })
        .catch((e: unknown) => {
          callbacks.error(e instanceof Error ? e.message : JSON.stringify(e));
          console.error(e);
        });
    };
    call();
    this.intervals.set(toId(params), setInterval(call, this.duration));
  }

  close(params: Json): void {
    const interval = this.intervals.get(toId(params));
    if (interval) {
      clearInterval(interval);
    }
  }
}

function toId(params: Json): string {
  if (typeof params == "object") {
    const strparams = Object.entries(params)
      .map(([key, value]) => `${key}:${btoa(JSON.stringify(value))}`)
      .sort();
    return `[${strparams.join(",")}]`;
  } else return btoa(JSON.stringify(params));
}
