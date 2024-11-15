import PersonalRoutes from "./routes/PersonalRoutes";
import ServerRoutes from "./routes/ServerRoutes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainContainer from "./components/shared/MainContainer";
import ChannelsContainer from "./components/shared/ChannelsContainer";

function App() {
  return (
    // TODO: move ServersContainer up so that it's not rerendered
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
              managmentPanel={<div>Managment</div>}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
