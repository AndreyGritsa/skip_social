import { useAppSelector } from "../../app/hooks";
import {
  useGetExternalsWeatherQuery,
  useDeleteSubscriptionMutation,
} from "../../services/endpoints/externals";
import { skipToken } from "@reduxjs/toolkit/query";
import Grid from "@mui/material/Grid2";
import { Box, Typography, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { WeatherCities } from "../../features/subscriptions/subscriptionsSlice";
import DeleteIcon from "@mui/icons-material/Delete";

const WeatherSubscription = ({ id }: { id: string }) => {
  const user = useAppSelector((state) => state.user);
  const { data } = useGetExternalsWeatherQuery(
    user.id ? { profile_id: user.id, type: "weather", id } : skipToken
  );
  const [forecast, setForecast] = useState<Record<string, any>[]>([]);
  const [city, setCity] = useState<string>("");
  const [deleteSubscription] = useDeleteSubscriptionMutation();
  const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState<number>(0);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    if (isWeatherData(data)) {
      setForecast(mapHourlyForecast(data[0]));
      setCity(getCityName(data[0].longitude, data[0].latitude));
      setLastUpdatedTimestamp(Date.now());
    }
  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const getCityName = (longitude: number, latitude: number): string => {
    const tolerance = 0.1;
    for (const city in WeatherCities) {
      const cityData = WeatherCities[city as keyof typeof WeatherCities];
      if (
        Math.abs(cityData.longitude - longitude) < tolerance &&
        Math.abs(cityData.latitude - latitude) < tolerance
      ) {
        return city;
      }
    }
    return "";
  };

  const handleDeleteSubscripion = () => {
    deleteSubscription(id)
      .unwrap()
      .catch((error) => console.error(error));
  };

  return isWeatherData(data) ? (
    <Grid container spacing={2}>
      <Grid size={12}>
        Last updated:{" "}
        {Math.ceil((currentTimestamp - lastUpdatedTimestamp) / 1000)} seconds
        ago.
      </Grid>
      <Grid size={6}>
        <Typography variant="h6">Weather: {city}</Typography>
      </Grid>
      <Grid container size={6} sx={{ justifyContent: "flex-end" }}>
        <IconButton onClick={handleDeleteSubscripion}>
          <DeleteIcon />
        </IconButton>
      </Grid>
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
