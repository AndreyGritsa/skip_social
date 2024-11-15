import { Route, Routes } from "react-router-dom";

const ServerRoutes = () => {
  return (
    <Routes>
      <Route path="/:serverId" element={<div>Server Page</div>} />
    </Routes>
  );
};

export default ServerRoutes;
