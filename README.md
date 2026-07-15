# GraphQL Chat

GraphQL Chat is a portfolio chat application with an Expo client and a MongoDB-backed GraphQL API.

## Current status

The project has been dependency-modernized and remains available as source code. The API uses GraphQL Yoga 5, MongoDB 7, and Google Secret Manager; the mobile/web client uses Expo 57, Apollo Client 4, and React Navigation 7.

The historical Google App Engine URL is not presented as a guaranteed live service. Configure your own API URL for local development or deployment.

## Repository layout

- `api/`: GraphQL API, subscriptions, and MongoDB persistence
- `app/`: Expo application for iOS, Android, and web

## Run locally

Start MongoDB and provide its connection string:

```bash
cd api
npm install
DB_HOST=mongodb://localhost:27017 npm start
```

The GraphQL endpoint and subscription transport are available at `http://localhost:4000/graphql` and `ws://localhost:4000/graphql`.

In another terminal, point `app/app.config.js` at those URLs and start Expo:

```bash
cd app
npm install
npm run dev
```

To verify the web bundle without starting an interactive development session:

```bash
cd app
npm run web
```

## Configuration

The API reads `DB_HOST` from the environment first. When it is absent, it loads the latest `DB_HOST` secret version from Google Secret Manager using `GOOGLE_CLOUD_PROJECT` (defaulting to the original `graphqlchatgcp` project).

Do not commit database credentials or exported service-account keys. Use environment variables or your deployment platform's secret store.

## License

MIT
