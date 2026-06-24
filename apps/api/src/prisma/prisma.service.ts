import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const databaseURL = PrismaService.buildDatabaseUrl()

    super({
      datasources: {
        db: {
          url: databaseURL,
        },
      },
      log: ['warn', 'error'],
      errorFormat: 'pretty',
    })
  }

  private static buildDatabaseUrl(): string {
    const {
      DB_USERNAME: username,
      DB_PASSWORD: password,
      DB_HOST: host,
      DB_PORT: port,
      DB_NAME: database,
      DATABASE_URL: databaseUrl,
    } = process.env

    if (databaseUrl) {
      return databaseUrl
    }

    if (!username || !password || !host || !port || !database) {
      console.error('Missing database environment variables:', {
        DB_USERNAME: !!username,
        DB_PASSWORD: !!password,
        DB_HOST: !!host,
        DB_PORT: !!port,
        DB_NAME: !!database,
      })

      throw new Error('Missing required database configuration')
    }

    const encodedPassword = encodeURIComponent(password)

    const url = `postgresql://${username}:${encodedPassword}@${host}:${port}/${database}?schema=public&sslmode=require`

    console.log(`✅ Database configured`)

    return url
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
