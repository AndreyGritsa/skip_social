import type { Json, JsonObject } from "@skipruntime/api";

export const isJsonObject = (value: Json): value is JsonObject => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};
