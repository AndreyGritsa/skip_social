import { useAppSelector } from "../../app/hooks";
import { useGetExternalsWeatherQuery } from "../../services/endpoints/externals";
import { skipToken } from "@reduxjs/toolkit/query";
import Grid from "@mui/material/Grid2";
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const WeatherSubscription = ({ id }: { id: string }) => {
  const user = useAppSelector((state) => state.user);
  const { data, refetch: refetchExternals } = useGetExternalsWeatherQuery(
    user.id ? { profile_id: user.id, type: "weather", id } : skipToken
  );
  const [forecast, setForecast] = useState<Record<string, any>[]>([]);

  const mapHourlyForecast = (data: Record<string, any>) => {
    const { temperature_2m: temperatures, time: times } = data.hourly;

    // Map temperatures with corresponding times
    const mappedForecast = times.map((time: any, index: number) => ({
      time,
      temperature: temperatures[index],
    }));

    return mappedForecast;
  };

  const isWeatherData = (data: any) => {
    if (data && data.length > 0 && data[0].current) return true;
  };

  useEffect(() => {
    isWeatherData(data) && setForecast(mapHourlyForecast(data[0]));
  }, [data]);

  return isWeatherData(data) ? (
    <Grid container spacing={2}>
      <Grid size={6}>Temperature: {data[0].current.temperature_2m}°C</Grid>
      <Grid size={6}>Wind speed: {data[0].current.wind_speed_10m} m/s</Grid>
      <Grid size={12}>
        <Box sx={{ display: "flex", gap: 5, overflowX: "auto" }}>
          {forecast.map((forecast: any) => (
            <Typography key={forecast.time}>
              {new Date(forecast.time).toLocaleTimeString([], {
                hour: "2-digit",
                day: "numeric",
              })}{" "}
              {forecast.temperature}°C
            </Typography>
          ))}
        </Box>
      </Grid>
    </Grid>
  ) : null;
};

export default WeatherSubscription;
