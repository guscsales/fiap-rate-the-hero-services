import { schemaValidator } from '@domains/shared/middleware/schema-validator';
import * as yup from 'yup';
import { generateHashedValue } from '@domains/shared/helpers/generate-hashed-value';
import DatabaseService from '@domains/shared/services/database-service';
import { User, UserType } from '@prisma/client';
import { ServiceError } from '@domains/shared/services/service-error';
import { StatusCodes } from '@domains/shared/enums/status-codes';
import { UserValidationErrors } from '@domains/users/enums/user-validation-errors';
import { ServicesOptionals } from '@domains/shared/models/services-optionals';

export interface GetUserByIdRequest {
  id: string;
}

async function getUserById(
  { id }: GetUserByIdRequest,
  { noValidation }: ServicesOptionals = {},
): Promise<Omit<User, 'password'> | null> {
  const userData = await DatabaseService.instance(
    async (prisma) =>
      prisma.user.findFirst({
        where: { id },
        select: {
          password: false,
        },
      }) as unknown as Omit<User, 'password'>,
  );

  if (!userData) {
    if (!noValidation) {
      throw new ServiceError({
        statusCode: StatusCodes.NotFound,
        error: UserValidationErrors.NotFound,
      });
    }

    return null;
  }

  const { password, ...finalUserData } = userData as User;

  return finalUserData;
}

const getUserByIdSchemaValidator = schemaValidator({
  body: yup
    .object()
    .nullable()
    .shape({
      id: yup.string().required('ID is a required field'),
    })
    .required('You must send the ID'),
});

export interface GetUserByEmailRequest {
  email: string;
}

async function getUserByEmail(
  { email }: GetUserByEmailRequest,
  { noValidation }: ServicesOptionals = {},
): Promise<Omit<User, 'password'> | null> {
  let userData = await DatabaseService.instance(async (prisma) =>
    prisma.user.findFirst({
      where: {
        email,
      },
    }),
  );

  if (!userData) {
    if (!noValidation) {
      throw new ServiceError({
        statusCode: StatusCodes.NotFound,
        error: UserValidationErrors.NotFound,
      });
    }

    return null;
  }

  const { password, ...finalUserData } = userData as User;

  return finalUserData;
}

const getUserByEmailSchemaValidator = schemaValidator({
  body: yup
    .object()
    .nullable()
    .shape({
      email: yup.string().email().required('Email is a required field'),
    })
    .required('You must send the Email'),
});

export interface GetUserByEmailAndPasswordRequest {
  email: string;
  password: string;
}

async function getUserByEmailAndPassword(
  payload: GetUserByEmailAndPasswordRequest,
  { noValidation }: ServicesOptionals = {},
): Promise<Omit<User, 'password'> | null> {
  const hashedPassword = generateHashedValue(payload.password);

  const userData = await DatabaseService.instance(
    async (prisma) =>
      prisma.user.findFirst({
        where: {
          email: payload.email,
          password: hashedPassword,
        },
      }) as unknown as Omit<User, 'password'>,
  );

  if (!userData) {
    if (!noValidation) {
      throw new ServiceError({
        statusCode: StatusCodes.NotFound,
        error: UserValidationErrors.NotFound,
      });
    }

    return null;
  }

  const { password, ...finalUserData } = userData as User;

  return finalUserData;
}

const getUserByEmailAndPasswordSchemaValidator = schemaValidator({
  body: yup
    .object()
    .nullable()
    .shape({
      email: yup.string().email().required('Email is a required field'),
      password: yup.string().required('Password is a required field'),
    })
    .required('You must send the Email and Password'),
});

export interface CreateCommonUserRequest {
  user: User;
}

async function createCommonUser({
  user,
}: CreateCommonUserRequest): Promise<Omit<User, 'password'>> {
  const userFromEmail = await UserService.getUserByEmail(
    { email: user.email },
    { noValidation: true },
  );

  if (userFromEmail) {
    throw new ServiceError({
      statusCode: StatusCodes.Conflict,
      error: UserValidationErrors.EmailExists,
    });
  }

  const hashedPassword = generateHashedValue(user.password);

  const userData = await DatabaseService.instance(
    async (prisma) =>
      prisma.user.create({
        data: {
          ...user,
          userType: UserType.Common,
          password: hashedPassword,
        },
      }) as unknown as Omit<User, 'password'>,
  );

  const { password, ...finalUserData } = userData as User;

  return finalUserData;
}

const createCommonUserSchemaValidator = schemaValidator({
  body: yup
    .object()
    .nullable()
    .shape({
      email: yup.string().email().required('Email is a required field'),
      password: yup.string().required('Password is a required field'),
    })
    .required('You must send the Email and Password'),
});

const UserService = {
  getUserById,
  getUserByIdSchemaValidator,
  getUserByEmail,
  getUserByEmailSchemaValidator,
  getUserByEmailAndPassword,
  getUserByEmailAndPasswordSchemaValidator,
  createCommonUser,
  createCommonUserSchemaValidator,
};

export default UserService;
