# Backend

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
