import { getAuthorizationHeaders } from '@domains/authentications/helpers/get-authorization-headers';
import AuthenticationService, {
  LoginRequest,
  SignUpCommonUserRequest,
} from '@domains/authentications/services/authentication-service';
import { StatusCodes } from '@domains/shared/enums/status-codes';
import { coreMiddleware } from '@domains/shared/middleware';
import { ApiRequest } from '@domains/shared/models/api-request';
import response from '@domains/shared/services/response';
import middy from '@middy/core';

export const getSession = middy(async ({ headers }: ApiRequest) => {
  try {
    const { token } = getAuthorizationHeaders(headers);

    const data = await AuthenticationService.getSession(token);

    return response(StatusCodes.OK, { data });
  } catch ({ statusCode, error }) {
    return response(statusCode, { error });
  }
}).use(coreMiddleware());

export const login = middy(async ({ body }: ApiRequest<LoginRequest>) => {
  try {
    const data = await AuthenticationService.login(body);

    return response(StatusCodes.OK, { data });
  } catch ({ statusCode, error }) {
    return response(statusCode, { error });
  }
})
  .use(coreMiddleware({ requireTokenValidator: false }))
  .use(AuthenticationService.loginSchemaValidator);

export const signUpCommonUser = middy(
  async ({ body }: ApiRequest<SignUpCommonUserRequest>) => {
    try {
      const data = await AuthenticationService.signUpCommonUser(body);

      return response(StatusCodes.OK, { data });
    } catch ({ statusCode, error }) {
      return response(statusCode, { error });
    }
  },
)
  .use(coreMiddleware({ requireTokenValidator: false }))
  .use(AuthenticationService.signUpCommonUserSchemaValidator);
