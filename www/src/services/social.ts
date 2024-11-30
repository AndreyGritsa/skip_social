import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const socialApi = createApi({
  reducerPath: "socialApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_PUBLIC_BACKEND_URL,
  }),
  refetchOnFocus: false,
  endpoints: () => ({}),
});

export default socialApi;
