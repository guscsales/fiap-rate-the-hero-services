import { StatusCodes } from '@domains/shared/enums/status-codes';
import { coreMiddleware } from '@domains/shared/middleware';
import response from '@domains/shared/services/response';
import middy from '@middy/core';
import HeroService, {
  SearchHeroesRequest,
} from '@domains/heroes/services/hero-service/index';
import { ApiRequest } from '@domains/shared/models/api-request';

export const dumpData = middy(async () => {
  try {
    await HeroService.dumpData();

    return response(StatusCodes.OK);
  } catch ({ statusCode, error }) {
    return response(statusCode, { error });
  }
}).use(coreMiddleware());

export const getHeroBySlug = middy(async ({ pathParameters }: ApiRequest) => {
  try {
    const { slug } = pathParameters as { slug: string };

    const data = await HeroService.getHeroBySlug({
      slug,
    });

    return response(StatusCodes.OK, { data });
  } catch ({ statusCode, error }) {
    return response(statusCode, { error });
  }
})
  .use(coreMiddleware({ requireTokenValidator: false }))
  .use(HeroService.getHeroBySlugSchemaValidator);

export const search = middy(
  async ({
    queryStringParameters: searchParams,
  }: ApiRequest<SearchHeroesRequest>) => {
    try {
      const results = await HeroService.searchHeroes(
        searchParams as unknown as SearchHeroesRequest,
      );

      return response(StatusCodes.OK, results);
    } catch ({ statusCode, error }) {
      return response(statusCode, { error });
    }
  },
)
  .use(coreMiddleware({ requireTokenValidator: false }))
  .use(HeroService.searchHeroesSchemaValidator);
