import { RedisClient } from "bun";
import app from "./app";
import { config } from "./config";

export const redisClient = new RedisClient(config.redis.url);

async function start() {
  try {
    await redisClient.ping();
    console.log("Redis connected");

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error(`Failed to start server:`, error);
    process.exit(1);
  }
}

start();
