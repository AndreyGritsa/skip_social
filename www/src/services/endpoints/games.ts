import socialApi, { handleEventSource } from "../social";

export type Game = {
  id: number;
  name: string;
  slug: string;
};

export const extendedGamesSlice = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getGames: builder.query<Game[], void>({
      query: () => `games/`,
    }),
  }),
});

export const { useGetGamesQuery } = extendedGamesSlice;
