import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { useState, Fragment } from "react";
import { WeatherCities } from "../../features/subscriptions/subscriptionsSlice";
import { useAddExternalSubscriptionMutation } from "../../services/endpoints/externals";
import { useAppSelector } from "../../app/hooks";

const NewSubscriptionDialog = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [subsctiptionType, setSubscriptionType] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [addSubscription] = useAddExternalSubscriptionMutation();
  const user = useAppSelector((state) => state.user);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddSubscription = () => {
    switch (subsctiptionType) {
      case "wehather":
        if (city in WeatherCities) {
          const params = {
            city: city,
            latitude:
              WeatherCities[city as keyof typeof WeatherCities].latitude,
            longitude:
              WeatherCities[city as keyof typeof WeatherCities].longitude,
            hourly: "temperature_2m,relative_humidity_2m",
            current: "temperature_2m,wind_speed_10m",
          };
          addSubscription({ type: "weather", params: params, profile_id: user.id})
            .unwrap()
            .catch((error) => console.error(error));
        }

        break;
      case "currency":
        console.log("Currency subscription");
        break;
      default:
        break;
    }
    handleClose();
  };

  const handleChange = (event: SelectChangeEvent, type: string) => {
    switch (type) {
      case "subscription":
        setSubscriptionType(event.target.value as string);
        break;
      case "city":
        setCity(event.target.value as string);
        break;
      default:
        break;
    }
  };

  return (
    <Fragment>
      <Button fullWidth onClick={handleClickOpen} variant="outlined">
        New Subscription
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>New Subscription</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">
                Subscription type
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={subsctiptionType}
                label="Subscription type"
                onChange={(event) => handleChange(event, "subscription")}
              >
                <MenuItem value={"wehather"}>Weather</MenuItem>
                <MenuItem value={"currency"}>Currency exchange rates</MenuItem>
              </Select>
            </FormControl>
            {subsctiptionType === "wehather" && (
              <FormControl fullWidth>
                <InputLabel id="select-weather-city-label">City</InputLabel>
                <Select
                  labelId="select-weather-city-label"
                  id="select-weather-city"
                  value={city}
                  label="City"
                  onChange={(event) => handleChange(event, "city")}
                >
                  <MenuItem value={"Barcelona"}>Barcelona</MenuItem>
                  <MenuItem value={"London"}>London</MenuItem>
                  <MenuItem value={"New York"}>New York</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" onClick={handleAddSubscription}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default NewSubscriptionDialog;
