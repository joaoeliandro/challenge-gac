import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const isDev = process.env.NODE_ENV !== 'production';

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console({
      format: isDev
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
              return `${timestamp} [${level}] ${message} ${metaStr}`;
            }),
          )
        : winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(), // JSON estruturado em produção
          ),
      level: isDev ? 'debug' : 'info',
    }),
  ],
};
