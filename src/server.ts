import { createApp } from "@/app";
import { env } from "@/config/env";
import { prisma } from "@/lib/prisma";

const start = async (): Promise<void> => {
  const app = createApp();

  await prisma.$connect();

  const server = app.listen(env.port, () => {
    console.info(`[express-boilerplate] listening on http://localhost:${env.port}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.info(`[express-boilerplate] ${signal} received, shutting down...`);
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
};

start().catch((error) => {
  console.error("[express-boilerplate] failed to start", error);
  process.exit(1);
});
