import { Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { styled } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import {
  useGetTicTacToeQuery,
  usePostTicTacToeMutation,
} from "../../services/endpoints/games";
import { useEffect } from "react";
import { useAppSelector } from "../../app/hooks";

const TicTacToeButton = styled(Button)({
  height: "60px",
  width: "60px",
});

const TicTacToeContainer = () => {
  const { roomId } = useParams();
  const { data, error } = useGetTicTacToeQuery(roomId!);
  const [postTicTacToe] = usePostTicTacToeMutation();
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    console.log(data);
    error && console.error(error);
  }, [data, error]);

  const handleUpdate = (index: number) => {
    const gameData = data && data.length > 0 && data[0];
    if (gameData) {
      const sign = gameData[`${user.id}_`];

      if (sign === gameData.last_move) return;
      if (sign === "O" && gameData.last_move === "") return;
      if (gameData[index + 1]) return;
      if (gameData.winning_combo) return;

      postTicTacToe({
        1: gameData[1],
        2: gameData[2],
        3: gameData[3],
        4: gameData[4],
        5: gameData[5],
        6: gameData[6],
        7: gameData[7],
        8: gameData[8],
        9: gameData[9],
        room_id: roomId!,
        last_move: sign as string,
        [index + 1]: sign,
      })
        .unwrap()
        .catch((e) => console.error(e));
    }
  };

  const isWinButton = (index: number) => {
    if (data && data.length > 0 && data[0].winning_combo) {
      return data[0].winning_combo.includes(index + 1);
    }
    return false;
  };
  return (
    <Grid container spacing={1} sx={{ mt: 6 }}>
      {Array.from({ length: 9 }, (_, i) => (
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
            {data && data.length > 0 && data[0][i + 1]}
          </TicTacToeButton>
        </Grid>
      ))}
    </Grid>
  );
};

export default TicTacToeContainer;
