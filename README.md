# Booklib
This is a ebook management API. It has features to ebook visualization.

# Getting started
- Prerequisites:
* Nodejs (version >= 12), take a look [here](https://docs.nestjs.com/first-steps);
* Any HTTP client: Postman, Insomnia, cUrl...;

1. Open the terminal inside a folder and clone this repository:
```sh
git clone https://github.com/DavidEsdrs/booklib.git
```

2. CD to the repository folder:
```sh
cd booklib/
```

3. Install the dependencies:
```sh
npm install
OR
yarn
```

4. In the root folder, create a .env:
```env
DATABASE_URL="mysql://<user>:<password>@<host>:<port>/booklib"
JWT_SECRET="secret"
JWT_SECRET_LIFESPAN="1h"
SERVER_PORT=4747
```
**Tip**: change the database url to match your credentials and database url. SERVER_PORT is optional, default is 3000
**warning**: Both jwt variables are set with non secure values (secret should be a hash), however, it still work for development purposes

4. Run the prisma migrations (Make sure you have a running MySQL container or so, and set the enviroment variables correctly):
```sh
npx prisma migrate deploy
```

5. Generate the typescript types for prisma (for development purposes):
```sh
npx prisma generate
```
**note**: This command also estabilishes the link between the prisma CLI and your .env file

6. Run the api:
```sh
npm run start:dev
OR
yarn start:dev
```

7. Enjoy!

# TODO
- Tests
- Swagger documantation