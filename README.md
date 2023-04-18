# Rate The Hero Services

## How to run?

### Env file

First create a `.env.local` file on the source of project with the following content

```
DATABASE_URL=postgres://admin:12345678@localhost:5432/rate_the_hero?schema=public

# Optional
SUPER_HERO_API_BASE_URL=https://superheroapi.com/api.php/<your_id>

# Para gerar um token para o JWT execute o comando abaixo no terminal
# logo após copie o valor gerado e cole no valor da variável "AUTHENTICATION_SECRET"
#    node -e "console.log(crypto.randomBytes(32).toString('hex'))"
#
# OBS: Lembre de gerar um token diferente para cada ambiente
AUTHENTICATION_SECRET=<your key>
```

### Commands

Install docker on your machine and run

```
docker-compose up
```

in another terminal window, install the packages, run migrations and run the project

```
yarn install
yarn migrate
yarn dev
```
