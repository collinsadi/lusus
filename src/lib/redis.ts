import IORedis from "ioredis";
import { ENVIRONMENT } from "../common/config/environment";

let redisClient: IORedis | null = null;

export function getRedisClient(): IORedis {
  if (redisClient) return redisClient;
  const url = ENVIRONMENT.REDIS.URL;
  if (!url) {
    throw new Error("Redis URL not set");
  }
  redisClient = new IORedis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });
  return redisClient;
}
