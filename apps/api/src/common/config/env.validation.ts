import * as Joi from 'joi';

export function validate(config: Record<string, unknown>) {
  const schema = Joi.object({
    DATABASE_URL:   Joi.string().required(),
    JWT_SECRET:     Joi.string().min(16).required(),
    JWT_EXPIRES_IN: Joi.string().default('7d'),
    NODE_ENV:       Joi.string().valid('development', 'production', 'test').default('development'),
    API_PORT:       Joi.number().default(3001),
  }).unknown(true);

  const { error, value } = schema.validate(config);
  if (error) throw new Error(`Erro de configuração: ${error.message}`);
  return value;
}
