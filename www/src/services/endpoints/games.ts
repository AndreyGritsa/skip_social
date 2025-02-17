import socialApi, { handleEventSource } from "../social";

export type Game = {
  id: number;
  name: string;
  slug: string;
};

type Invite = {
  from_id: string;
  to_id: string;
  status: "pending" | "accepted" | "declined";
  room_id: string;
};

export const extendedGamesSlice = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getGames: builder.query<Game[], void>({
      query: () => `games/`,
    }),
    getInvites: builder.query<Invite[], string>({
      query: (id) => `games/invites/?id=${id}`,
      onCacheEntryAdded(arg, { cacheDataLoaded, cacheEntryRemoved, updateCachedData }) {
        handleEventSource(
          `/api/games/invites/?id=${arg}`,
          {
            init: (data: Invite[]) => {
              updateCachedData((draft) => {
                draft.length = 0;
                data.forEach((invite) => draft.push(invite));
              });
            },
            update: (data: Invite[]) => {
              updateCachedData((draft) => {
                draft.length = 0;
                data.forEach((invite) => draft.push(invite));
              });
            },
          },
          cacheDataLoaded,
          cacheEntryRemoved
        );
      },
    }),
    postInvite: builder.mutation<Game, { from_id: string; to_id: string, room_id: string }>({
      query: ({ from_id, to_id, room_id }) => ({
        url: `games/invites/`,
        method: "POST",
        body: { from_id, to_id, room_id },
      }),
    }),
  }),
});

export const { useGetGamesQuery, useGetInvitesQuery, usePostInviteMutation } =
  extendedGamesSlice;
