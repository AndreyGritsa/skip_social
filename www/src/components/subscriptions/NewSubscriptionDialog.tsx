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

const NewSubscriptionDialog = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [subsctiptionType, setSubscriptionType] = useState<string>("");
  const [city, setCity] = useState<string>("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
                <MenuItem value={"curreny"}>Currency exchange rates</MenuItem>
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
                  <MenuItem value={"barcelona"}>Barcelona</MenuItem>
                  <MenuItem value={"london"}>London</MenuItem>
                  <MenuItem value={"new_york"}>New York</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default NewSubscriptionDialog;
