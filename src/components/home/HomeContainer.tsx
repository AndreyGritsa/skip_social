import Grid from "@mui/material/Grid2";
import { Paper } from "@mui/material";
import SinglePost from "./SinglePost";
import { useAppSelector } from "../../app/hooks";

const HomeContainer = () => {
  const posts = useAppSelector((state) => state.posts.posts);

  return (
    <Paper sx={{ p: 1, height: "100%", overflowY: "auto" }} elevation={4}>
      <Grid
        container
        spacing={2}
        sx={{
          // TODO: couldn't figure out how to use 100% instead
          // current solution is not responsive vertically
          height: "1dvh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {posts.map((element, index) => (
          <Grid key={index} size={{ xs: 12, md: 8 }}>
            <SinglePost {...element} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default HomeContainer;
