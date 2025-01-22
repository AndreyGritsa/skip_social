import type {
  EagerCollection,
  Resource,
  Context,
  Mapper,
  Values,
  Json,
} from "@skipruntime/api";
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
    let query_params = {}
    const subcriptionArray = collections.externalServiceSubscriptions.getArray(
      this.id
    );

    if (subcriptionArray && subcriptionArray.length > 0) {
      query_params = subcriptionArray[0]!.query_params
    }
    return context.useExternalResource<string, WeatherResults>({
      service: "externalAPI",
      identifier: "weatherAPI",
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
