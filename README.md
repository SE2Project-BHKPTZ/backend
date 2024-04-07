# Backend

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=SE2Project-BHKPTZ_backend&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=SE2Project-BHKPTZ_backend)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=SE2Project-BHKPTZ_backend&metric=coverage)](https://sonarcloud.io/summary/new_code?id=SE2Project-BHKPTZ_backend)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=SE2Project-BHKPTZ_backend&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=SE2Project-BHKPTZ_backend)

## Configure environment variables

To run the projects you need to set the following environment variables (in an `.env` file for example):

- `PORT` - The port the application will be running on
- `SIO_ADMINUI_USERNAME` (optional) - Username for the admin UI
- `SIO_ADMINUI_PASSWORD` (optional) - Password for the admin UI, needs to be encrypted using bcrypt
- `MONGO_HOST` - URL or hostname of the mongodb database
- `MONGO_INITDB_ROOT_USERNAME` - username for mongodb is used in the backend and the database
- `MONGO_INITDB_ROOT_PASSWORD` - password for mongodb is used in the backend and the database
- `ACCESS_TOKEN_SECRET` - secret used for jwt access token
- `ACCESS_TOKEN_TTL` - TTL for jwt access token
- `REFRESH_TOKEN_SECRET` - secret used for jwt refresh token
- `REFRESH_TOKEN_TTL` - TTL used for jwt refresh token
Example:

```
PORT=8080 # port used for express and socket.io
SIO_ADMINUI_PASSWORD=******** # encrypted with bcrypt see link below
SIO_ADMINUI_USERNAME=admin # username for the admin interface
MONGO_HOST=localhost
#mongo db
MONGO_INITDB_ROOT_USERNAME=user
MONGO_INITDB_ROOT_PASSWORD=passwort
#JWT
REFRESH_TOKEN_SECRET=supersecret
REFRESH_TOKEN_TTL=2h
ACCESS_TOKEN_SECRET=secret
ACCESS_TOKEN_TTL=2d
```

You can use the [Bcrypt generator](https://bcrypt-generator.com/) to generate the bcrypt hash for the `SIO_ADMINUI_PASSWORD`.

## Run with docker
After the `.env` file is set up you can start the database and backend with:

```
docker-compose up -d
```

## Debugging Socket io

The following tools can be useful when debugging SocketIO:

- [Online connection checker](https://amritb.github.io/socketio-client-tool/)
- The Admin UI that is hosted on http://localhost:53212/sioadmin

## Contribution

This project follows the [conventional commit guidelines](https://www.conventionalcommits.org/en/v1.0.0/) and also enforces semantic PR titles to maintain a clear and understandable project history.

### Commit/PR Types and Scopes

For an up-to-date list of commit and PR types and their scopes, please refer to [this](https://github.com/SE2Project-BHKPTZ/frontend/blob/main/.github/workflows/validate-semantic-pr.yml).

#### Commit/PR Types Include:

- `feat`: Introduction of a new feature.
- `fix`: A bug correction.
- `build`: Modifications that affect the build system or external dependencies.
- `chore`: Miscellaneous changes that don't modify source or test files.
- `ci`: Adjustments to our CI configuration files and scripts.
- `docs`: Documentation updates.
- `perf`: Changes that enhance performance.
- `refactor`: Code alterations that neither fix a bug nor introduce a feature.
- `revert`: Undoing a previous commit.
- `style`: Changes that do not impact the code's meaning (white-space, formatting, etc.).
- `test`: Adding missing tests or correcting existing ones.

Example Commit and PR Title:

```
feat: Add login and register activities
```