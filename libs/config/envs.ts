import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  GATEWAY_PORT: number;
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  JWE_PRIVATE_KEY_PATH: string;
  JWE_PUBLIC_KEY_PATH: string;
}

const envVarsSchema: joi.ObjectSchema = joi
  .object({
    GATEWAY_PORT: joi.number().required(),
    DATABASE_HOST: joi.string().required(),
    DATABASE_PORT: joi.number().required(),
    DATABASE_USER: joi.string().required(),
    DATABASE_PASSWORD: joi.string().required(),
    DATABASE_NAME: joi.string().required(),
    JWE_PRIVATE_KEY_PATH: joi.string().required(),
    JWE_PUBLIC_KEY_PATH: joi.string().required(),
  })
  .unknown(true);

const { value: envVars, error } = envVarsSchema.validate(process.env, {
  allowUnknown: true,
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envs = {
  gateway: {
    port: envVars.GATEWAY_PORT,
  },

  database: {
    host: envVars.DATABASE_HOST,
    port: envVars.DATABASE_PORT,
    user: envVars.DATABASE_USER,
    password: envVars.DATABASE_PASSWORD,
    DatabaseName: envVars.DATABASE_NAME,
  },

  jwe: {
    privateKeyPath: envVars.JWE_PRIVATE_KEY_PATH,
    publicKeyPath: envVars.JWE_PUBLIC_KEY_PATH,
  },
};
