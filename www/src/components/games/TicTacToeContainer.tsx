import { Button, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { styled } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import {
  useGetTicTacToeQuery,
  usePostTicTacToeMutation,
  useIncreaseScoreMutation,
} from "../../services/endpoints/games";
import { useAppSelector } from "../../app/hooks";

const TicTacToeButton = styled(Button)({
  height: "60px",
  width: "60px",
});

const TicTacToeContainer = () => {
  const { roomId } = useParams();
  const { data } = useGetTicTacToeQuery(roomId!);
  const [postTicTacToe] = usePostTicTacToeMutation();
  const [increaseScore] = useIncreaseScoreMutation();
  const user = useAppSelector((state) => state.user);

  const getGameData = () => data && data.length > 0 && data[0];

  const handleUpdate = (index: number) => {
    const gameData = getGameData();
    if (gameData) {
      const sign = gameData[`${user.id}_`];

      if (
        sign === gameData.last_move ||
        (sign === "O" && gameData.last_move === "") ||
        gameData[index + 1] ||
        (Array.isArray(gameData.winning_combo) &&
          gameData.winning_combo.length > 0)
      )
        return;

      postTicTacToe({
        ...gameData,
        room_id: roomId!,
        last_move: sign as string,
        [index + 1]: sign,
      })
        .unwrap()
        .catch((e) => console.error(e));
    }
  };

  const isWinButton = (index: number) => {
    const gameData = getGameData();
    return (
      gameData &&
      gameData.winning_combo &&
      gameData.winning_combo.includes(index + 1)
    );
  };

  const handleIncreaseScore = () => {
    const gameData = getGameData();
    if (gameData) {
      const players: string[] = gameData.players;
      const scoreData: any = gameData.score;
      const newScore = players.reduce((acc, player) => {
        const oldScore = scoreData[player] || 0;
        acc[player] = oldScore + (player === gameData.winner ? 1 : 0);
        return acc;
      }, {} as any);
      console.log(`New Score: ${JSON.stringify(newScore)}`);

      increaseScore({ room_id: roomId!, ...newScore })
        .unwrap()
        .catch((e) => console.error(e));
    }
  };

  const renderPlayerInfo = () => {
    const gameData = getGameData();
    return (
      gameData &&
      gameData.players.map((player, index) => (
        <Grid size={6} sx={{ mb: 2 }} key={index}>
          <Typography variant="h4" align="center">
            {player}:{" "}
            {user.name === player
              ? gameData[`${user.id}_`]
              : gameData[`${user.id}_`] === "X"
              ? "O"
              : "X"}
          </Typography>
        </Grid>
      ))
    );
  };

  const renderButtons = () => {
    const gameData = getGameData();
    return Array.from({ length: 9 }, (_, i) => (
      <Grid
        size={4}
        key={i}
        sx={{
          display: "flex",
          justifyContent:
            i % 3 === 0 ? "flex-end" : i % 3 === 1 ? "center" : "flex-start",
        }}
      >
        <TicTacToeButton
          variant={isWinButton(i) ? "contained" : "outlined"}
          onClick={() => handleUpdate(i)}
        >
          {gameData && gameData[i + 1]}
        </TicTacToeButton>
      </Grid>
    ));
  };

  const renderScore = () => {
    const gameData = getGameData();
    return (
      gameData &&
      gameData.players.map((key, index) => (
        <Grid size={6} key={index} sx={{ mb: 4 }}>
          <Typography align="center" variant="h4" color="success">
            {gameData.score[key as any]}
          </Typography>
        </Grid>
      ))
    );
  };

  return (
    <Grid container spacing={1} sx={{ mt: 3 }}>
      {renderPlayerInfo()}
      {renderScore()}
      {renderButtons()}
      <Grid size={12} sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          {data && data.length > 0 && data[0].winner ? (
            <Typography variant="h5" color="success">{`Winner: ${data[0].winner}`}</Typography>
          ) : (
            data &&
            data.length > 0 &&
            Boolean(data[0].draw) && <Typography variant="h5" color="success">Draw!</Typography>
          )}
          {data && data.length > 0 && (data[0].winner || Boolean(data[0].draw)) && (
            <Button variant="contained" onClick={handleIncreaseScore} color="success">
              New Game
            </Button>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default TicTacToeContainer;
