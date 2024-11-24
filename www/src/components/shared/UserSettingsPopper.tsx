import * as React from "react";
import {
  IconButton,
  Box,
  Popper,
  Fade,
  Paper,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  SelectChangeEvent,
  Button,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { setUser } from "../../features/user/userSlice";
import { useSetStatusMutation } from "../../services/endpoints/users";

const UserSettingsPopper = () => {
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [open, setOpen] = React.useState<boolean>(false);
  const [status, setStatus] = React.useState<string>(user.status);
  const [triggerStatusMutation] = useSetStatusMutation();

  const handleChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value);
  };

  const handleSettingClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };

  const handleSaveStatus = () => {
    if (status !== user.status) {
      dispatch(setUser({ id: user.id, name: user.name, status: status }));
      triggerStatusMutation({ profile_id: user.id, new_status: status })
        .unwrap()
        .then((payload) => console.log(payload))
        .catch((error) => console.error(error));
    }
    setOpen(!open);
  };

  return (
    <Box sx={{ ml: "auto", display: "flex", direction: "column" }}>
      <Popper open={open} anchorEl={anchorEl} placement="top" transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper sx={{ p: 2 }}>
              <FormControl
                sx={{ m: 1, minWidth: 120, width: "100%" }}
                size="small"
              >
                <InputLabel id="select-user-status">Status</InputLabel>
                <Select
                  labelId="select-user-status"
                  id="select-user"
                  value={status}
                  label="Status"
                  onChange={handleChange}
                >
                  <MenuItem value={"online"}>Online</MenuItem>
                  <MenuItem value={"away"}>Away</MenuItem>
                </Select>
              </FormControl>
              <Button fullWidth onClick={handleSaveStatus}>
                Save
              </Button>
            </Paper>
          </Fade>
        )}
      </Popper>
      <IconButton onClick={handleSettingClick}>
        <SettingsIcon />
      </IconButton>
    </Box>
  );
};

export default UserSettingsPopper;
