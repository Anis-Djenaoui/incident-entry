import knex, { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const knexConfig: Knex.Config = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
};

export const db: Knex = knex(knexConfig);
