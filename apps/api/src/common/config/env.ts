import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['test', 'development', 'production'])
    .default('development'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS: z.coerce.string().default('http://localhost:3000'),
  API_PORT: z.coerce.number().optional().default(3001),
})

export type Env = z.infer<typeof envSchema>
