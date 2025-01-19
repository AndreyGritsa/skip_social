import Grid from "@mui/material/Grid2";
import { Paper } from "@mui/material";
import NewSubscriptionDialog from "./NewSubscriptionDialog";
import { useAppSelector } from "../../app/hooks";
import WeatherSubscription from "./WeatherSubscription";

const SubscriptionContainer = () => {
  const subscriptions = useAppSelector(
    (state) => state.subscriptions.subscriptions
  );

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <NewSubscriptionDialog />
      </Grid>
      {subscriptions.map(
        (subscription) =>
          subscription.type === "weather" && (
            <Grid key={subscription.id} size={12}>
              <Paper sx={{ p: 2 }}>
                <WeatherSubscription id={subscription.id} />
              </Paper>
            </Grid>
          )
      )}
    </Grid>
  );
};

export default SubscriptionContainer;
