"use server"

import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import path from 'path';

/**
 * 自动执行数据库迁移
 * 在生产环境启动时自动运行
 */
export async function runMigrations() {
  if (!process.env.DSN) {
    console.error('❌ DSN environment variable is not set');
    process.exit(1);
  }

  console.log('🔄 Starting database migrations...');

  const migrationClient = postgres(process.env.DSN, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    // 获取迁移文件路径
    const migrationsFolder = path.join(process.cwd(), 'drizzle');

    // 执行迁移
    await migrate(db, { migrationsFolder });

    console.log('Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // 关闭连接
    await migrationClient.end();
  }
}

/**
 * 检查数据库连接
 */
export async function checkDatabaseConnection(retries = 30, delay = 2000): Promise<boolean> {
  if (!process.env.DSN) {
    console.error('❌ DSN environment variable is not set');
    return false;
  }

  for (let i = 0; i < retries; i++) {
    try {
      const client = postgres(process.env.DSN, { max: 1 });
      await client`SELECT 1`;
      await client.end();
      console.log('Database connection established');
      return true;
    } catch (error) {
      console.error(`⏳ Waiting for database... (${i + 1}/${retries})`, error);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error('❌ Failed to connect to database after', retries, 'attempts');
  return false;
}