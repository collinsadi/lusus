import * as dotenv from "dotenv";
dotenv.config();

export const ENVIRONMENT = {
  APP: {
    NAME: process.env.APP_NAME ?? "Backend Server",
    PORT: process.env.PORT ? parseInt(process.env.PORT) : 9009,
    ENV: process.env.APP_ENV ?? "development",
    JWT_SECRET: process.env.JWT_SECRET ?? "default-secret-change-in-production",
    FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:9000",
  },
};
