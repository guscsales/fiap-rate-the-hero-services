import { StatusCodes } from '@domains/shared/enums/status-codes';
import { coreMiddleware } from '@domains/shared/middleware';
import response from '@domains/shared/services/response';
import middy from '@middy/core';
import HeroService from '@domains/heroes/services/hero-service/index';

export const dumpData = middy(async () => {
  try {
    await HeroService.dumpData();

    return response(StatusCodes.OK);
  } catch ({ statusCode, error }) {
    return response(statusCode, { error });
  }
}).use(coreMiddleware());
