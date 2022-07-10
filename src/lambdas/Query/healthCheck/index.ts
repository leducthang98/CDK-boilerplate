import { defaultCommonFunction } from '../../Layer/common/nodejs/common';
import { getPrismaClient } from '../../Layer/dblayer/nodejs/dblayer';

export async function handler(): Promise<string> {
  let prismaHealthCheckResponse;
  const responseCommonFunction = defaultCommonFunction();
  try {
    const prismaClient = await getPrismaClient();
    prismaHealthCheckResponse = await prismaClient.demo.findMany();
  } catch (error) {
    prismaHealthCheckResponse = `prisma_connection_error:${error}`;
  }

  return JSON.stringify({
    prisma: `${prismaHealthCheckResponse}, ${responseCommonFunction}`,
  });
}