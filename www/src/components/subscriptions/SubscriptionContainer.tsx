import Grid from "@mui/material/Grid2";
import { Paper } from "@mui/material";
import NewSubscriptionDialog from "./NewSubscriptionDialog";
import { useAppSelector } from "../../app/hooks";
import WeatherSubscription from "./WeatherSubscription";
import CryptoSubscription from "./CryptoSubscription";
import { useEffect } from "react";
import { useInvalidateExternalsMutation } from "../../services/endpoints/externals";

const SubscriptionContainer = () => {
  const subscriptions = useAppSelector(
    (state) => state.subscriptions.subscriptions
  );
  const [invalidateExternals] = useInvalidateExternalsMutation();

  useEffect(() => {
    return () => {
      invalidateExternals();
    };
  }, [invalidateExternals]);

  return (
    <Grid container spacing={2} sx={{height: "1dvh",}}>
      <Grid size={12}>
        <NewSubscriptionDialog />
      </Grid>
      {subscriptions.map(
        (subscription) =>
          subscription.type === "weather" ? (
            <Grid key={subscription.id} size={12}>
              <Paper sx={{ p: 2 }}>
                <WeatherSubscription id={subscription.id} />
              </Paper>
            </Grid>
          ) :
          subscription.type === "crypto" ? (
          <Grid key={subscription.id} size={12}>
              <Paper sx={{ p: 2 }}>
                <CryptoSubscription id={subscription.id} />
              </Paper>
            </Grid>
            ) : null
      )}
    </Grid>
  );
};

export default SubscriptionContainer;
