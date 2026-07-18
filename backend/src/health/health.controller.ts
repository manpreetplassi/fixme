import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  async check() {
    let database: 'ok' | 'not_initialized' | 'error' = 'not_initialized';

    if (this.dataSource.isInitialized) {
      try {
        await this.dataSource.query('SELECT 1');
        database = 'ok';
      } catch {
        database = 'error';
      }
    }

    return {
      status: database === 'ok' ? 'ok' : 'degraded',
      database,
      hasDatabaseUrl: Boolean(this.config.get<string>('DATABASE_URL')),
      environment: this.config.get<string>('NODE_ENV') ?? 'development',
    };
  }
}
