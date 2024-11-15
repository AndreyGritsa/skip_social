import Grid from "@mui/material/Grid2";
import SinglePost from "./SinglePost";
import { useAppSelector } from "../../app/hooks";

const HomeContainer = () => {
  const posts = useAppSelector((state) => state.posts.posts);

  return (
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
  );
};

export default HomeContainer;
