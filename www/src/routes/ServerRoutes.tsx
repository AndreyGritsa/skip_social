import { Route, Routes } from "react-router-dom";
import ServerRoomPage from "../pages/ServerRoomPage";

const ServerRoutes = () => {
  return (
    <Routes>
      <Route path=":serverId/:roomId" element={<ServerRoomPage />} />
    </Routes>
  );
};

export default ServerRoutes;
