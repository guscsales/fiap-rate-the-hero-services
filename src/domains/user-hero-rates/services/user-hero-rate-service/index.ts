import { schemaValidator } from '@domains/shared/middleware/schema-validator';
import DatabaseService from '@domains/shared/services/database-service';
import * as yup from 'yup';
import { ServiceError } from '../../../shared/services/service-error/index';
import { StatusCodes } from '@domains/shared/enums/status-codes';
import { UserHeroRateValidationErrors } from '@domains/user-hero-rates/enums/user-hero-rate-validation-errors';
import HeroService from '@domains/heroes/services/hero-service';
import { ServicesOptionals } from '@domains/shared/models/services-optionals';

export interface GetUserHeroRateByIdRequest {
  id: number;
  userId: string;
}

async function getUserHeroRateById(
  { id, userId }: GetUserHeroRateByIdRequest,
  { noValidation }: ServicesOptionals = {},
) {
  const data = await DatabaseService.instance(async (prisma) =>
    prisma.userHeroRate.findFirst({ where: { id, userId } }),
  );

  if (!data) {
    if (!noValidation) {
      throw new ServiceError({
        statusCode: StatusCodes.NotFound,
        error: UserHeroRateValidationErrors.NotFound,
      });
    }

    return null;
  }

  return data;
}

const getUserHeroRateByIdSchemaValidator = schemaValidator({
  body: yup
    .object()
    .nullable()
    .shape({
      id: yup.number().required('ID is a required field'),
    })
    .required('You must send the ID'),
});

export interface CreateUserHeroRateRequest {
  userId: string;
  heroId: number;
  assessment: number;
}

async function createUserHeroRate(payload: CreateUserHeroRateRequest) {
  const { userId, heroId } = payload;
  const existsHeroRate = await DatabaseService.instance((prisma) =>
    prisma.userHeroRate.count({
      where: { userId, heroId },
    }),
  );

  if (!!existsHeroRate) {
    throw new ServiceError({
      statusCode: StatusCodes.Conflict,
      error: UserHeroRateValidationErrors.AlreadyExists,
    });
  }

  // Check if hero exists
  await HeroService.getHeroById({ id: heroId as number });

  const userHeroRateData = await DatabaseService.instance((prisma) =>
    prisma.userHeroRate.create({
      data: {
        assessment: payload.assessment,
      },
    }),
  );

  return userHeroRateData;
}

const createUserHeroRateSchemaValidator = schemaValidator({
  body: yup
    .object()
    .nullable()
    .shape({
      assessment: yup
        .number()
        .min(1, 'Assessment must be greater than or equal to 1')
        .max(5, 'Assessment must be less than or equal to 5')
        .required('Assessment is a required field'),
      heroId: yup.number().required('Hero is required'),
    })
    .required(),
});

export interface UpdateUserHeroRateRequest {
  userHeroRateId: number;
  userId: string;
  assessment: number;
}

async function updateUserHeroRate(payload: UpdateUserHeroRateRequest) {
  const { userHeroRateId, userId } = payload;

  // Validate existence
  await getUserHeroRateById({ id: userHeroRateId, userId });

  const userHeroRateData = await DatabaseService.instance((prisma) =>
    prisma.userHeroRate.update({
      where: {
        id: userHeroRateId,
      },
      data: {
        assessment: payload.assessment,
      },
    }),
  );

  return userHeroRateData;
}

const updateUserHeroRateSchemaValidator = schemaValidator({
  body: yup
    .object()
    .nullable()
    .shape({
      assessment: yup
        .number()
        .min(1, 'Assessment must be greater than or equal to 1')
        .max(5, 'Assessment must be less than or equal to 5')
        .required('Assessment is a required field'),
      id: yup.number().required('User hero rate is required'),
    })
    .required(),
});

export interface DeleteUserHeroRateByIdRequest {
  id: number;
  userId: string;
}

async function deleteUserHeroRateById({
  id,
  userId,
}: DeleteUserHeroRateByIdRequest) {
  // Validate existence
  await getUserHeroRateById({ id, userId });

  await DatabaseService.instance((prisma) =>
    prisma.userHeroRate.delete({ where: { id } }),
  );
}

const deleteUserHeroRateByIdSchemaValidator = schemaValidator({
  body: yup
    .object()
    .nullable()
    .shape({
      id: yup.number().required('User hero rate is required'),
    })
    .required(),
});

const UserHeroRateService = {
  getUserHeroRateById,
  getUserHeroRateByIdSchemaValidator,
  createUserHeroRate,
  createUserHeroRateSchemaValidator,
  updateUserHeroRate,
  updateUserHeroRateSchemaValidator,
  deleteUserHeroRateById,
  deleteUserHeroRateByIdSchemaValidator,
};

export default UserHeroRateService;
