import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

config();

// Determine if we're running from compiled code or source
// When using typeorm-ts-node-commonjs, __dirname points to src/config
// When running compiled code, __dirname points to dist/config
// Always go up one level from config (works for both src/config and dist/config)
const rootPath = path.join(__dirname, '..');

export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'backend_db',
  entities: [path.join(rootPath, '**/*.entity{.ts,.js}')],
  migrations: [path.join(rootPath, 'migrations/*{.ts,.js}')],
  synchronize: false, // Always use migrations, never synchronize
  logging: process.env.NODE_ENV === 'development',
};

export default new DataSource(typeormConfig);
