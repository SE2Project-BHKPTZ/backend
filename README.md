# Backend

## Configure environment variables

To run the projects you need to set the following environment variables (in an `.env` file for example):

- `PORT` - The port the application will be running on
- `SIO_ADMINUI_USERNAME` (optional) - Username for the admin UI
- `SIO_ADMINUI_PASSWORD` (optional) - Password for the admin UI, needs to be encrypted using bcrypt

Example:

```
PORT=8080 # port used for express and socket.io
SIO_ADMINUI_PASSWORD=******** # encrypted with bcrypt see link below
SIO_ADMINUI_USERNAME=admin # username for the admin interface
```

You can use the [Bcrypt generator](https://bcrypt-generator.com/) to generate the bcrypt hash for the `SIO_ADMINUI_PASSWORD`.

## Debugging Socket io

The following tools can be useful when debugging SocketIO:

- [Online connection checker](https://amritb.github.io/socketio-client-tool/)
- The Admin UI that is hosted on http://localhost:53212/sioadmin
