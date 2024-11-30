import { useState } from "react";
import { useTheme, Tab, Tabs, Box, TextField, Button } from "@mui/material";
import FriendsTabPanel from "./FriendsTabPanel";
import FriendRequests from "./FriendsRequests";
import { usePostFriendRequestMutation } from "../../services/endpoints/users";
import { useAppSelector } from "../../app/hooks";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`friends-tabpanel-${index}`}
      aria-labelledby={`friends-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `friends-tab-${index}`,
    "aria-controls": `friends-tabpanel-${index}`,
  };
}

const FriendsTabs = () => {
  const [value, setValue] = useState<number>(0);
  const [userRequestName, setUserRequestName] = useState<string>("");
  const theme = useTheme();
  const [triggerPostFriendRequest] = usePostFriendRequestMutation();
  const user = useAppSelector((state) => state.user);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleSendFriendRequest = () => {
    triggerPostFriendRequest({
      from_profile: user.id,
      to_profile: userRequestName,
    })
      .unwrap()
      .then(() => {
        setUserRequestName("");
      })
      .catch((error) => {
        console.error("Error sending friend request:", error);
      });
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label="friends tabs">
          <Tab label="Online" {...a11yProps(0)} />
          <Tab label="All" {...a11yProps(1)} />
          <Tab label="Requests" {...a11yProps(2)} />
          <Tab
            label="Add new friend"
            {...a11yProps(3)}
            sx={{ color: theme.palette.success.main }}
          />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <FriendsTabPanel online={true} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <FriendsTabPanel online={false} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <FriendRequests />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <TextField
          value={userRequestName}
          onChange={(e) => setUserRequestName(e.target.value)}
          label="User name"
          aria-label="send friend request"
          fullWidth
        />
        <Button
          onClick={handleSendFriendRequest}
          fullWidth
          variant="contained"
          sx={{ mt: 1 }}
        >
          Send Request
        </Button>
      </CustomTabPanel>
    </Box>
  );
};

export default FriendsTabs;
