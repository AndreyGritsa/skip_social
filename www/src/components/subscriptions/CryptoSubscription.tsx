import { useAppSelector } from "../../app/hooks";
import {
  useGetExternalsWeatherQuery,
  useDeleteSubscriptionMutation,
} from "../../services/endpoints/externals";
import { skipToken } from "@reduxjs/toolkit/query";
import Grid from "@mui/material/Grid2";
import { Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const CryptoSubscription = ({ id }: { id: string }) => {
  const user = useAppSelector((state) => state.user);
  const { data } = useGetExternalsWeatherQuery(
    user.id ? { profile_id: user.id, type: "crypto", id } : skipToken
  );
  const [deleteSubscription] = useDeleteSubscriptionMutation();

  const isCryptoData = (data: any) => {
    if (data && data.length > 0 && data[0].data) return true;
  };

  const handleDeleteSubscripion = () => {
    deleteSubscription(id)
      .unwrap()
      .catch((error) => console.error(error));
  };

  return isCryptoData(data) ? (
    <Grid container spacing={2}>
      <Grid size={6}>
        <Typography variant="h6">Coin: {data[0].data.name}</Typography>
      </Grid>
      <Grid container size={6} sx={{ justifyContent: "flex-end" }}>
        <IconButton onClick={handleDeleteSubscripion}>
          <DeleteIcon />
        </IconButton>
      </Grid>
      <Grid size={6}>Price: {parseFloat(data[0].data.priceUsd).toFixed(2)} USD</Grid>
      <Grid size={6}>Market cap: {parseFloat(data[0].data.marketCapUsd).toFixed(2)} USD</Grid>
    </Grid>
  ) : null;
};

export default CryptoSubscription;
