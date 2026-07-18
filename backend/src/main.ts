import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp, seedDemoDataIfEnabled } from './configure-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  configureApp(app);
  await seedDemoDataIfEnabled(app);

  await app.listen(config.get<number>('PORT') ?? 3001);
}

void bootstrap();
