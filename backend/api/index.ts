import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { configureApp, seedDemoDataIfEnabled } from '../src/configure-app';

const express = require('express');

let cachedServer: any;

async function bootstrapServer() {
  if (cachedServer) return cachedServer;

  const expressServer = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressServer));

  configureApp(app);
  await app.init();
  await seedDemoDataIfEnabled(app);

  cachedServer = expressServer;
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  try {
    const server = await bootstrapServer();
    return server(req, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown bootstrap error';
    const stack = error instanceof Error ? error.stack : undefined;

    console.error('Vercel bootstrap failed:', stack ?? message);

    return res.status(500).json({
      error: {
        message: 'Backend bootstrap failed',
        detail: message,
        path: req.url,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
