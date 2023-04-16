import { isAfter } from 'date-fns';
import { getDataFromToken } from '@domains/authentications/helpers/get-data-from-token';
import { StatusCodes } from '@domains/shared/enums/status-codes';
import { AuthenticationValidationErrors } from '@domains/authentications/enums/authentication-validation-errors';
import { JwtPayload } from 'jsonwebtoken';
import { ServiceError } from '@domains/shared/services/service-error';
import { schemaValidator } from '@domains/shared/middleware/schema-validator';
import * as yup from 'yup';
import { generateHashedValue } from '@domains/shared/helpers/generate-hashed-value';
import { Session } from '@domains/authentications/models/session';
import DatabaseService from '@domains/shared/services/database-service';
import { UserType } from '@prisma/client';
import { signToken } from '@domains/authentications/helpers/sign-token';

async function isValidToken(token: string): Promise<boolean> {
  const openedToken = getDataFromToken(token);

  if (!openedToken) {
    throw new ServiceError({
      statusCode: StatusCodes.Internal,
      error: AuthenticationValidationErrors.InvalidCredentials,
    });
  }

  const { exp, sub } = openedToken;

  if (!sub || !exp) {
    return false;
  }

  // Validate sub
  // TODO: implement user logic
  let isTokenValid = true;

  // Validate expiration time
  const currentDate = new Date();
  const isTokenExpired = isAfter(currentDate, exp * 1000);

  return isTokenValid && !isTokenExpired;
}

function getSession(token: string): JwtPayload {
  try {
    const { iat, ...session } = getDataFromToken(token);

    return session;
  } catch (e) {
    throw new ServiceError({
      statusCode: StatusCodes.Internal,
      error: e.message,
    });
  }
}

interface GenerateTokenRequest {
  id: string;
  userType: UserType;
  email: string;
}

async function generateToken({ id, ...payload }: GenerateTokenRequest) {
  // Generate token
  const session = await signToken(
    { sub: id, ...payload },
    600, // 10 minutes
  );

  return session;
}

export interface LoginRequest {
  email: string;
  password: string;
}

async function login({ email, password }: LoginRequest): Promise<Session> {
  const hashedPassword = generateHashedValue(password);

  const userData = await DatabaseService.instance(async (prisma) =>
    prisma.user.findFirst({
      where: { email, password: hashedPassword },
    }),
  );

  if (!userData) {
    throw new ServiceError({
      statusCode: StatusCodes.Unauthorized,
      error: AuthenticationValidationErrors.InvalidCredentials,
    });
  }

  const session = await generateToken(userData);

  return {
    token: session.token,
    exp: session.exp as number,
  };
}

const loginSchemaValidator = schemaValidator({
  body: yup
    .object()
    .nullable()
    .shape({
      email: yup.string().email().required('Email is a required field'),
      password: yup.string().required('Password is a required field'),
    })
    .required('You must send the Email and Password'),
});

const AuthenticationService = {
  isValidToken,
  getSession,
  login,
  loginSchemaValidator,
};

export default AuthenticationService;
