import { useState } from "react";
import { useTheme, Tab, Tabs, Box } from "@mui/material";
import FriendsTabPanel from "./FriendsTabPanel";

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const FriendsTabs = () => {
  const [value, setValue] = useState<number>(0);
  const theme = useTheme();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label="friends tabs">
          <Tab label="Online" {...a11yProps(0)} />
          <Tab label="All" {...a11yProps(1)} />
          <Tab
            label="Add new friend"
            {...a11yProps(2)}
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
        Add new friend
      </CustomTabPanel>
    </Box>
  );
};

export default FriendsTabs;
