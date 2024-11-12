import { useAppSelector } from "../../app/hooks";
import { Paper, Box, Typography, IconButton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CustomAvatar from "./CustomAvatar";

const User = () => {
  const user = useAppSelector((state) => state.user);

  return (
    <Paper sx={{ p: 1 }} elevation={4}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <CustomAvatar src="/" alt={user.name} status={user.status} />
        <Typography variant="body1">
          <strong>{user.name}</strong>
        </Typography>
        <IconButton sx={{ ml: "auto" }}>
          <SettingsIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default User;
