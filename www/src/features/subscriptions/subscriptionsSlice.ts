import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const WeatherCities = {
  Barcelona: {
    longitude: 2.1734,
    latitude: 41.3851
  },
  London: {
    longitude: 0.1278,
    latitude: 51.5074
  },
  "New York": {
    longitude: 74.0060,
    latitude: 40.7128
  }
}

export interface Subscription {
  id: string;
  type: string;
  query_params: Record<string, any>;
  profile_id: string;
  data?: Record<string, any>;
}

export interface SubscriptionsState {
  subscriptions: Subscription[];
}

// fake initial state, should be empty
const initialState: SubscriptionsState = {
  subscriptions: [],
};

export const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    setSubscriptions: (state, action: PayloadAction<Subscription[]>) => {
      state.subscriptions = action.payload;
    },
  },
});

export const { setSubscriptions } = subscriptionsSlice.actions;

export default subscriptionsSlice.reducer;
