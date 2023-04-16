import { HeroValidationErrors } from '@domains/heroes/enums/hero-validation-errors';
import { StatusCodes } from '@domains/shared/enums/status-codes';
import normalizeString from '@domains/shared/helpers/normalize-string';
import { schemaValidator } from '@domains/shared/middleware/schema-validator';
import { ServicesOptionals } from '@domains/shared/models/services-optionals';
import DatabaseService from '@domains/shared/services/database-service';
import { ServiceError } from '@domains/shared/services/service-error';
import { Hero, Prisma } from '@prisma/client';
import axios from 'axios';
import * as yup from 'yup';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function dumpData() {
  console.log('Dump started');

  const alphabet = ['a', 'b', 'c', 'd', 'e'];

  for (let i = 0; i < alphabet.length; i++) {
    console.log(`Searching on letter "${alphabet[i]}"`);

    const { data } = await axios.get(
      `${process.env.SUPER_HERO_API_BASE_URL}/search/${alphabet[i]}`,
    );

    if (data.results) {
      console.log(`Found ${data.results.length} heroes`);

      for (const hero of data.results) {
        console.log(`Starting next hero: ${hero.id}`);

        const heroExists = await DatabaseService.instance(async (prisma) =>
          prisma.hero.count({
            where: {
              id: parseInt(hero.id),
            },
          }),
        );

        if (heroExists) {
          console.log(`Hero ${hero.id} already on database, no actions to do`);
          continue;
        }

        console.log(`Hero "${hero.name} (${hero.id})" found`);
        try {
          await DatabaseService.instance(async (prisma) =>
            prisma.hero.create({
              data: {
                id: parseInt(hero?.id),
                slug: `${normalizeString(hero?.name)}${
                  hero?.biography?.['full-name']
                    ? `-${normalizeString(hero?.biography?.['full-name'])}`
                    : ''
                }`,
                name: hero?.name,
                secretIdentity: hero?.biography?.['full-name'],
                placeOfBirth: hero?.biography?.['place-of-birth'],
                universe: hero?.biography?.publisher,
                firstAppearance: hero?.biography?.['first-appearance'],
                pictureURL: hero?.image?.url,
                combat: hero?.powerstats?.combat,
                durability: hero?.powerstats?.durability,
                intelligence: hero?.powerstats?.intelligence,
                power: hero?.powerstats?.power,
                speed: hero?.powerstats?.speed,
                strength: hero?.powerstats?.strength,
                eyeColor: hero?.appearance?.['eye-color'],
                hairColor: hero?.appearance?.['hair-color'],
                race: hero?.appearance?.race,
                height: hero?.appearance?.height || [],
                weight: hero?.appearance?.weight || [],
                gender: hero?.appearance?.gender,
              },
            }),
          );
        } catch (e) {
          console.log(e);
        }

        console.log('Added to database');
      }
    } else {
      console.log('No results found');
    }

    console.log("Let's wait some seconds");
    await sleep(30000);
  }

  console.log('Dump ended');
}

export interface GetHeroByIdRequest {
  id: number;
}

async function getHeroById(
  { id }: GetHeroByIdRequest,
  { noValidation }: ServicesOptionals = {},
) {
  const heroData = await DatabaseService.instance(async (prisma) =>
    prisma.hero.findFirst({ where: { id } }),
  );

  if (!heroData) {
    if (!noValidation) {
      throw new ServiceError({
        statusCode: StatusCodes.NotFound,
        error: HeroValidationErrors.NotFound,
      });
    }

    return null;
  }

  return heroData;
}

const getHeroByIdSchemaValidator = schemaValidator({
  body: yup
    .object()
    .nullable()
    .shape({
      id: yup.number().required('ID is a required field'),
    })
    .required('You must send the ID'),
});

export interface GetHeroBySlugRequest {
  slug: string;
}

async function getHeroBySlug(
  { slug }: GetHeroBySlugRequest,
  { noValidation }: ServicesOptionals = {},
) {
  const heroData = await DatabaseService.instance(async (prisma) =>
    prisma.hero.findUnique({ where: { slug } }),
  );

  if (!heroData) {
    if (!noValidation) {
      throw new ServiceError({
        statusCode: StatusCodes.NotFound,
        error: HeroValidationErrors.NotFound,
      });
    }

    return null;
  }

  return heroData;
}

const getHeroBySlugSchemaValidator = schemaValidator({
  body: yup
    .object()
    .nullable()
    .shape({
      slug: yup.string().required('Slug is a required field'),
    })
    .required('You must send the Slug'),
});

export interface SearchHeroesRequest {
  q: string;
  limit: string;
}

const searchHeroesDefaultParams: Omit<SearchHeroesRequest, 'q'> = {
  limit: '50',
};

async function searchHeroes({ q, ...params }: SearchHeroesRequest) {
  const { limit } = { ...searchHeroesDefaultParams, ...params };

  const limitParam = parseInt(limit);

  const where = {
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { secretIdentity: { contains: q, mode: 'insensitive' } },
      { placeOfBirth: { contains: q, mode: 'insensitive' } },
      { universe: { contains: q, mode: 'insensitive' } },
    ],
  } as Prisma.HeroWhereInput;

  const totalResults = await DatabaseService.instance(async (prisma) =>
    prisma.hero.count({
      where,
    }),
  );

  let items: Hero[] = [];

  if (totalResults > 0) {
    items = await DatabaseService.instance(async (prisma) =>
      prisma.hero.findMany({
        where,
        orderBy: { secretIdentity: 'asc' },
        take: limitParam,
      }),
    );
  }

  return { items, totalResults, limit: limitParam };
}

const searchHeroesSchemaValidator = schemaValidator({
  body: yup
    .object()
    .nullable()
    .shape({
      q: yup.string().required('Search value is a required field'),
      limit: yup.number().nullable(),
    })
    .required(),
});

const HeroService = {
  dumpData,
  getHeroById,
  getHeroByIdSchemaValidator,
  getHeroBySlug,
  getHeroBySlugSchemaValidator,
  searchHeroes,
  searchHeroesSchemaValidator,
};

export default HeroService;
