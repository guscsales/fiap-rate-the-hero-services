import { StatusCodes } from '@domains/shared/enums/status-codes';
import { coreMiddleware } from '@domains/shared/middleware';
import response from '@domains/shared/services/response';
import middy from '@middy/core';
import { ApiRequest } from '@domains/shared/models/api-request';
import UserHeroRateService, {
  CreateUserHeroRateRequest,
  UpdateUserHeroRateRequest,
} from '@domains/user-hero-rates/services/user-hero-rate-service';
import { getAuthorizationHeaders } from '@domains/authentications/helpers/get-authorization-headers';
import { getDataFromToken } from '@domains/authentications/helpers/get-data-from-token';

export const createUserHeroRate = middy(
  async ({ body, headers }: ApiRequest<CreateUserHeroRateRequest>) => {
    try {
      const { userId } = getDataFromToken(
        getAuthorizationHeaders(headers).token,
      );
      const data = await UserHeroRateService.createUserHeroRate({
        ...body,
        userId,
      });

      return response(StatusCodes.OK, { data });
    } catch ({ statusCode, error }) {
      return response(statusCode, { error });
    }
  },
)
  .use(coreMiddleware())
  .use(UserHeroRateService.createUserHeroRateSchemaValidator);

export const updateUserHeroRate = middy(
  async ({
    body,
    headers,
    pathParameters,
  }: ApiRequest<UpdateUserHeroRateRequest>) => {
    try {
      const { userId } = getDataFromToken(
        getAuthorizationHeaders(headers).token,
      );

      const { id } = pathParameters as { id: string };

      const data = await UserHeroRateService.updateUserHeroRate({
        ...body,
        userHeroRateId: parseInt(id),
        userId,
      });

      return response(StatusCodes.OK, { data });
    } catch ({ statusCode, error }) {
      return response(statusCode, { error });
    }
  },
)
  .use(coreMiddleware())
  .use(UserHeroRateService.updateUserHeroRateSchemaValidator);

export const getUserHeroRateById = middy(
  async ({ pathParameters, headers }: ApiRequest) => {
    try {
      const { id } = pathParameters as { id: string };

      const { userId } = getDataFromToken(
        getAuthorizationHeaders(headers).token,
      );
      const data = await UserHeroRateService.getUserHeroRateById({
        id: parseInt(id),
        userId,
      });

      return response(StatusCodes.OK, { data });
    } catch ({ statusCode, error }) {
      return response(statusCode, { error });
    }
  },
)
  .use(coreMiddleware())
  .use(UserHeroRateService.getUserHeroRateByIdSchemaValidator);

export const deleteUserHeroRateById = middy(
  async ({ pathParameters, headers }: ApiRequest) => {
    try {
      const { id } = pathParameters as { id: string };

      const { userId } = getDataFromToken(
        getAuthorizationHeaders(headers).token,
      );
      await UserHeroRateService.deleteUserHeroRateById({
        id: parseInt(id),
        userId,
      });

      return response(StatusCodes.OK);
    } catch ({ statusCode, error }) {
      return response(statusCode, { error });
    }
  },
)
  .use(coreMiddleware())
  .use(UserHeroRateService.deleteUserHeroRateByIdSchemaValidator);
