import { StatusCodes } from '@domains/shared/enums/status-codes';
import { ServiceError } from '@domains/shared/services/service-error';
import jwt, { JwtPayload, VerifyOptions } from 'jsonwebtoken';

export function getDataFromToken(token: string, options?: VerifyOptions) {
  try {
    return jwt.verify(
      token.replace('Bearer ', ''),
      Buffer.from(process.env.AUTHENTICATION_SECRET, 'base64'),
      options,
    ) as JwtPayload;
  } catch (e) {
    throw new ServiceError({
      statusCode: StatusCodes.Internal,
      error: e.message,
    });
  }
}
