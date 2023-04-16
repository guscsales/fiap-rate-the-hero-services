import { PrismaClient } from '@prisma/client';
import { ServiceError } from '@domains/shared/services/service-error';
import { StatusCodes } from '@domains/shared/enums/status-codes';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function instance<T>(execFunc: (prisma: PrismaClient) => Promise<T>) {
  try {
    return execFunc(prisma);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error on SQL:', e);

    throw new ServiceError({
      statusCode: StatusCodes.Internal,
    });
  } finally {
    await prisma.$disconnect();
  }
}

const DatabaseService = {
  instance,
};

export default DatabaseService;
