import GameCard from "./GameCard";
import Grid from "@mui/material/Grid2";
import { useGetGamesQuery } from "../../services/endpoints/games";

const GamesContainer = () => {
  const { data: games } = useGetGamesQuery();

  return (
    <Grid
      container
      spacing={2}
      sx={{
        height: "1dvh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {games &&
        games.map((element, index) => (
          <Grid size={12} key={index}>
            <GameCard {...element} />
          </Grid>
        ))}
    </Grid>
  );
};

export default GamesContainer;
