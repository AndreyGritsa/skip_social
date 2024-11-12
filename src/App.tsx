import AppRoutes from "./routes/AppRoutes";
import { BrowserRouter } from "react-router-dom";
import MainContainer from "./components/shared/MainContainer";

function App() {
  return (
    <BrowserRouter>
      <MainContainer>
        <AppRoutes />
      </MainContainer>
    </BrowserRouter>
  );
}

export default App;
