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
import SensorOccupiedIcon from "@mui/icons-material/SensorOccupied";
import { useAppSelector } from "../../app/hooks";
import { MouseEvent, useState, useEffect } from "react";
import { useGetAllUsersQuery } from "../../services/endpoints/users";

const UserSelectPopper = () => {
  const user = useAppSelector((state) => state.user);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const { data: users } = useGetAllUsersQuery();

  const handleChange = (event: SelectChangeEvent) => {
    setUserId(event.target.value);
  };

  const handleSettingClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };

  const handleChangeUser = () => {
    if (userId !== user.id) {
      localStorage.setItem("profile_id", userId);
      window.location.reload();
    }
    setOpen(!open);
  };

  useEffect(() => {
    setUserId(user.id);
  }, [user]);

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
                <InputLabel id="select-user">Select User</InputLabel>
                <Select
                  labelId="select-user"
                  id="select-user"
                  value={userId}
                  label="Select User"
                  onChange={handleChange}
                >
                  {users?.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button fullWidth onClick={handleChangeUser}>
                Change User
              </Button>
            </Paper>
          </Fade>
        )}
      </Popper>
      <IconButton onClick={handleSettingClick}>
        <SensorOccupiedIcon />
      </IconButton>
    </Box>
  );
};

export default UserSelectPopper;
