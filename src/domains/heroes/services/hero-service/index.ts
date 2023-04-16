import normalizeString from '@domains/shared/helpers/normalize-string';
import DatabaseService from '@domains/shared/services/database-service';
import axios from 'axios';

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

const HeroService = {
  dumpData,
};

export default HeroService;
