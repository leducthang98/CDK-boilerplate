import { PrismaClient } from '@prisma/client';
import { SecretsManager } from 'aws-sdk';

const secretManager = new SecretsManager();
let prisma: PrismaClient;

export async function getPrismaClient(): Promise<PrismaClient> {
  if (!prisma) {
    const dbUrl = await secretManager
      .getSecretValue({
        SecretId: process.env.SECRET_ID || '',
      })
      .promise();

    const secretString = JSON.parse(dbUrl.SecretString || '{}');

    const url = `mysql://${secretString.username}:${secretString.password}@${secretString.host}:${secretString.port}/${secretString.dbname}?connect_timeout=30&pool_timeout=30&socket_timeout=30&connection_limit=1`;

    prisma = new PrismaClient({
      datasources: { db: { url } },
    });
  }

  return prisma;
}