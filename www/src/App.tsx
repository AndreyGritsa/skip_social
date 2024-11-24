import PersonalRoutes from "./routes/PersonalRoutes";
import ServerRoutes from "./routes/ServerRoutes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainContainer from "./components/shared/MainContainer";
import ChannelsContainer from "./components/channel/ChannelsContainer";
import RoomsContainer from "./components/server/RoomsContainer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/*"
          element={
            <MainContainer
              page={<PersonalRoutes />}
              managmentPanel={<ChannelsContainer />}
            />
          }
        />
        <Route
          path="/server/*"
          element={
            <MainContainer
              page={<ServerRoutes />}
              managmentPanel={<RoomsContainer />}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
