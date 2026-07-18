import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser = require('cookie-parser');
import { DataSource } from 'typeorm';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { runSeed } from './database/seeds/seed';

export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const frontendUrls =
    config
      .get<string>('FRONTEND_URLS')
      ?.split(',')
      .map((url) => url.trim())
      .filter(Boolean) ?? [config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'];

  app.enableCors({
    origin: frontendUrls,
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('FixMe API')
    .setDescription('Personal gamified health and productivity dashboard API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
}

export async function seedDemoDataIfEnabled(app: INestApplication): Promise<void> {
  const config = app.get(ConfigService);
  const shouldSeedDemo = config.get<string>('DB_SEED_DEMO', 'false') === 'true';

  if (!shouldSeedDemo) return;

  const dataSource = app.get(DataSource);
  await runSeed(dataSource);
}
