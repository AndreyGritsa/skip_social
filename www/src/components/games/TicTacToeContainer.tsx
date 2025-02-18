import { Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { styled } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import {
  useGetTicTacToeQuery,
  usePostTicTacToeMutation,
} from "../../services/endpoints/games";
import { useEffect } from "react";

const TicTacToeButton = styled(Button)({
  height: "60px",
  width: "60px",
});

const TicTacToeContainer = () => {
  const { roomId } = useParams();
  const { data, error } = useGetTicTacToeQuery(roomId!);
  const [postTicTacToe] = usePostTicTacToeMutation();
  useEffect(() => {
    console.log(data);
    error && console.error(error);
  }, [data, error]);
  const handleUpdate = (index: number) => {
    postTicTacToe({
      room_id: roomId!,
      1: "X",
      2: "O",
      3: "X",
      4: "O",
      5: "X",
      6: "O",
      7: "X",
      8: "O",
      9: "X",
    })
      .unwrap()
      .catch((e) => console.error(e));

  }
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
            variant="outlined"
            onClick={() =>
              handleUpdate(i)
            }
          >{data && data.length > 0 && data[0][i+1]}</TicTacToeButton>
        </Grid>
      ))}
    </Grid>
  );
};

export default TicTacToeContainer;
