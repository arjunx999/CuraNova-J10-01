import Redis from "ioredis";

export const bullmqConnection = new Redis("redis://localhost:6379", {
  maxRetriesPerRequest: null,
});
