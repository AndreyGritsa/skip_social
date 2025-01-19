import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ChannelPage from "../pages/ChannelPage";
import FriendsPage from "../pages/FriendsPage";
import SubscriptionPage from "../pages/SubscriptionPage";

const PersonalRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/channel/:channelId" element={<ChannelPage />} />
      <Route path="/friends" element={<FriendsPage />} />
      <Route path="/subscriptions" element={<SubscriptionPage />} />
    </Routes>
  );
};

export default PersonalRoutes;
