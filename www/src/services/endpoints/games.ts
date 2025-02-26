import socialApi, { handleEventSource } from "../social";

export type Game = {
  id: number;
  name: string;
  slug: string;
};

type Invite = {
  id?: string;
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
  winning_combo: number[];
  players: string[];
  draw: string;
  [key: string]: string | number[] | string[];
};

export const extendedGamesSlice = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getGames: builder.query<Game[], void>({
      query: () => `games/`,
    }),
    getInvites: builder.query<Invite[], string>({
      query: (id) => `games/invites/?id=${id}`,
      onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, updateCachedData }
      ) {
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
    postInvite: builder.mutation<
      Game,
      { from_id: string; to_id: string; room_id: string }
    >({
      query: ({ from_id, to_id, room_id }) => ({
        url: `games/invites/`,
        method: "POST",
        body: { from_id, to_id, room_id },
      }),
    }),
    getTicTacToe: builder.query<TicTacToe[], string>({
      query: (id) => `games/tictactoe/?room_id=${id}`,
      onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, updateCachedData }
      ) {
        handleEventSource(
          `/api/games/tictactoe/?room_id=${arg}`,
          {
            init: (data: TicTacToe[]) => {
              updateCachedData((draft) => {
                draft.length = 0;
                data.forEach((invite) => draft.push(invite));
              });
            },
            update: (data: TicTacToe[]) => {
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
    postTicTacToe: builder.mutation<
      TicTacToe,
      {
        room_id: string;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: string;
        9: string;
        last_move: string;
      }
    >({
      query: (body) => ({
        url: `games/tictactoe/`,
        method: "POST",
        body,
      }),
    }),
    increaseScore: builder.mutation<
      string,
      { room_id: string; [key: string]: string }
    >({
      query: (data) => ({
        url: `games/tictactoe/score/`,
        method: "POST",
        body: data,
      }),
    }),
    updateInvite: builder.mutation<string, Invite & { id: string }>({
      query: (data) => ({
        url: `games/invites/${data.id}/`,
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetGamesQuery,
  useGetInvitesQuery,
  usePostInviteMutation,
  useGetTicTacToeQuery,
  usePostTicTacToeMutation,
  useIncreaseScoreMutation,
  useUpdateInviteMutation,
} = extendedGamesSlice;
