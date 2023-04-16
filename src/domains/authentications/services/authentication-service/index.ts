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
import { User, UserType } from '@prisma/client';
import { signToken } from '@domains/authentications/helpers/sign-token';
import UserService from '@domains/users/services/user-service';

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
  let isTokenValid = !!(await UserService.getUserById(
    { id: sub },
    { noValidation: true },
  ));

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

export interface LoginRequest {
  email: string;
  password: string;
}

async function login(payload: LoginRequest): Promise<Session> {
  const userData = await UserService.getUserByEmailAndPassword(payload, {
    noValidation: true,
  });

  if (!userData) {
    throw new ServiceError({
      statusCode: StatusCodes.Unauthorized,
      error: AuthenticationValidationErrors.InvalidCredentials,
    });
  }

  const session = await await signToken(
    { sub: userData.id, ...payload },
    3600, // 1 hour
  );

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

export interface SignUpCommonUserRequest {
  email: string;
  password: string;
}

async function signUpCommonUser({
  email,
  password,
}: SignUpCommonUserRequest): Promise<Session> {
  await UserService.createCommonUser({ user: { email, password } as User });

  const session = await login({ email, password });

  return session;
}

const signUpCommonUserSchemaValidator = schemaValidator({
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
  signUpCommonUser,
  signUpCommonUserSchemaValidator,
};

export default AuthenticationService;
