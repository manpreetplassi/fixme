import { ConfigService } from '@nestjs/config';

export function getDatabaseUrl(config: ConfigService): string | undefined {
  return (
    config.get<string>('DATABASE_URL_UNPOOLED') ??
    config.get<string>('POSTGRES_URL_NON_POOLING') ??
    config.get<string>('DATABASE_URL') ??
    config.get<string>('POSTGRES_URL')
  );
}

export function getDatabaseUrlFromEnv(): string | undefined {
  return (
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL
  );
}
