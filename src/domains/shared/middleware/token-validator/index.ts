import { getAuthorizationHeaders } from '@domains/authentications/helpers/get-authorization-headers';
import { StatusCodes } from '@domains/shared/enums/status-codes';
import AuthenticationService from '@domains/authentications/services/authentication-service';

export const tokenValidator = () => {
  const before = async (request) => {
    try {
      const { headers } = request.event;
      const { token } = getAuthorizationHeaders(headers);

      const isTokenValid = await AuthenticationService.isValidToken(token);

      if (isTokenValid) {
        return Promise.resolve();
      }

      return {
        statusCode: StatusCodes.Unauthorized,
      };
    } catch (e) {
      console.error('Error on Validate Token:', { error: e.message });

      return {
        statusCode: StatusCodes.Unauthorized,
      };
    }
  };

  return {
    before,
  };
};
