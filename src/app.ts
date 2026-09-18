import express, { type Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "@/config/env";
import { errorHandler } from "@/common/middleware/error-handler";
import { notFoundHandler } from "@/common/middleware/error-handler";
import { permissionVersionMiddleware } from "@/common/middleware/permission-version";
import { apiRouter } from "@/routes";

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
      exposedHeaders: ["x-perm-version"],
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(permissionVersionMiddleware);

  if (env.nodeEnv !== "test") {
    app.use(morgan("dev"));
  }

  app.get("/health", (_req, res) => {
    res.json({ status: 1, message: "OK" });
  });

  app.use("/", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
