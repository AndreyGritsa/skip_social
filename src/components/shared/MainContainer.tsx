import { ReactNode } from "react";
import { Container, Paper } from "@mui/material";
import Grid from "@mui/material/Grid2";
import User from "./User";
import ServersContainer from "./ServersContainer";

interface MainContainerProps {
  managmentPanel: ReactNode;
  page: ReactNode;
}

const MainContainer: React.FC<MainContainerProps> = ({
  page,
  managmentPanel,
}) => {
  return (
    <Container sx={{ p: 1, height: "100dvh" }} maxWidth="xl">
      <Grid container spacing={1}>
        <Grid size={1}>
          <ServersContainer />
        </Grid>
        <Grid size={{ xs: 5, md: 3 }} container direction="column" spacing={1}>
          <Grid sx={{ flexGrow: 1 }} size={12}>
            <Paper sx={{ p: 1, height: "100%" }} elevation={4}>
              {managmentPanel}
            </Paper>
          </Grid>
          <Grid size={12}>
            <User />
          </Grid>
        </Grid>
        <Grid size={{ xs: 6, md: 8 }}>
          <Paper sx={{ p: 1, height: "100%", overflowY: "auto" }} elevation={4}>
            {page}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MainContainer;
