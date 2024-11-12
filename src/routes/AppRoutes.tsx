import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ChannelPage from "../pages/ChannelPage";
import FriendsPage from "../pages/FriendsPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/channel/:channelId" element={<ChannelPage />} />
      <Route path="/friends" element={<FriendsPage />} />
    </Routes>
  );
};

export default AppRoutes;
