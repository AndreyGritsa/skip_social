import { ReactNode } from "react";
import { Container } from "@mui/material";
import Grid from "@mui/material/Grid2";
import User from "./User";
import ChannelsContainer from "./ChannelsContainer";

interface MainContainerProps {
  children: ReactNode;
}

const MainContainer: React.FC<MainContainerProps> = ({ children }) => {
  return (
    <Container sx={{ p: 1, height: "100dvh" }}>
      <Grid container sx={{ height: "100%" }} spacing={2}>
        <Grid size={{ xs: 5, md: 3 }} container direction="column" spacing={1}>
          <Grid sx={{ flexGrow: 1 }} size={12}>
            <ChannelsContainer />
          </Grid>
          <Grid size={12}>
            <User />
          </Grid>
        </Grid>
        <Grid size={{ xs: 7, md: 9 }}>{children}</Grid>
      </Grid>
    </Container>
  );
};

export default MainContainer;
