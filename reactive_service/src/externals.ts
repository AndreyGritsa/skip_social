import type {
  EagerCollection,
  Resource,
  Context,
  Mapper,
  NonEmptyIterator,
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
    values: NonEmptyIterator<ExternalServiceSubscription>
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
  constructor(private params: Record<string, string>) {}
  instantiate(
    collections: ResourcesCollection
  ): EagerCollection<string, ExternalServiceSubscription> {
    const profileId = this.params["profile_id"];
    if (profileId === undefined) {
      throw new Error("profile_id parameter is required");
    }
    return collections.profileExternalServiceSubscriptions.slice([
      profileId,
      profileId,
    ]);
  }
}

export class WeatherExternalResource implements Resource {
  constructor(private params: Record<string, string>) {}
  instantiate(
    collections: ResourcesCollection,
    context: Context
  ): EagerCollection<string, WeatherResults> {
    const id = this.params["id"];
    if (id === undefined) {
      throw new Error("id parameter is required");
    }

    const subcription = collections.externalServiceSubscriptions.getUnique(id);

    return context.useExternalResource<string, WeatherResults>({
      service: "externalAPI",
      identifier: "weatherAPI",
      params: subcription.query_params,
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
