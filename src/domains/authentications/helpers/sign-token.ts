import jwt, { JwtPayload } from 'jsonwebtoken';
import { getDataFromToken } from '@domains/authentications/helpers/get-data-from-token';

export function signToken(data: any, expiresIn: number) {
  const token = jwt.sign(
    data,
    Buffer.from(process.env.AUTHENTICATION_SECRET, 'base64'),
    { expiresIn },
  );
  const { exp } = getDataFromToken(token) as JwtPayload;

  return { token, exp };
}
