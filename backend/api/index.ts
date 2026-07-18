import { ExpressAdapter } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
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
  const server = await bootstrapServer();
  return server(req, res);
}
