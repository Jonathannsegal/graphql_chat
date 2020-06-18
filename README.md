# Graphql Chat 💬

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT) 
[![HitCount](http://hits.dwyl.com/jonathannsegal/graphql_chat.svg)](http://hits.dwyl.com/jonathannsegal/graphql_chat)

This project is a fullstack application with a React Native app with Apollo Client and an api using Apollo Server and Mongodb. 🎉

<a href="https://drive.google.com/uc?export=download&id=1Xtoi2lAjeOJLi5I_L3xIb_4HvIuFNW8T"><img src="https://raw.githubusercontent.com/Thukor/MazeSolver/master/resources/download.png" data-canonical-src="https://gyazo.com/eb5c5741b6a9a16c692170a41a49c858.png" height="80" /></a>



![Apollo React Graphql](https://d33wubrfki0l68.cloudfront.net/3ac42a60a07e4edd3907f79bad73ccb74edb2e70/8504d/static/apis@2x-f1fb43c194f7d6a0dae8bc7647396279.png)

## File structure 🗃️

This repo contains two projects the api and the app
- `api`: The backend of the project, Server
- `app`: The app, Client

![GraphqlChat](https://raw.githubusercontent.com/Jonathannsegal/graphql_chat/master/app/assets/icon.png)

## Local Development 💻

Follow the scripts below to get the project running on your machine.
To make local development easier the project is set up to run [Mongodb](https://www.mongodb.com/) and [Apollo](https://www.apollographql.com/server/) in Docker containers. 

This will work on Mac and Linux machines and Docker Hyper -V but if you are using WSL on windows 10 you may have connection errors between the containers and the react native app on your device. If you are having this problem it is because WSL is not exposed to the network by default, to fix instead of `npm up` run this:

```bash
$ docker stop apollo # Only run if you are using WSL
$ Set-Content -Path ".env" -Value "DB_HOST=mongodb://localhost:27017"
# running dev uses nodemon to hot reload
$ npm dev # # Only run if you are using WSL 
```

This stops the container, changes the location where `Apollo` is looking for the Mongodb instance, and runs the API using node.
This will allow your React App to connect to your machine instead of the WSL container.

### Make sure you have docker 🐋 installed on your machine.

```bash
$ git clone https://github.com/Jonathannsegal/graphql_chat.git

# API
$ cd api
$ npm install

# On Windows
$ Set-Content -Path ".env" -Value "DB_HOST=mongodb://mongo:27017"

# On Mac
$ touch ~/.env
$ echo "DB_HOST=mongodb://mongo:27017" >> ~/.inputrc

# If you are having above mentioned connection issues run the script above instead
$ npm up # This will run the docker-compose script

$ cd ..
```

We need to change the connection strings in `app\app.config.js` The values now point to the deployed instance of this repository, to point to the services that we just set up change values to what you see below:
```js
export default ({config}) => {
  return Object.assign(config,
    {
      extra: {
        WSHOST: 'ws://localhost:4000/graphql',
        HTTPHOST: 'http://localhost:4000/'
      }
    });
};
```

Now that our app is pointing to the correct api run this script to start expo bundler and run the app on your phone:

```bash
# APP
$ cd app
$ npm dev # This project is using expo, a website will open
# Scan the QR code on a mobile device
```

## Deploy 🚀

![Google App Engine](https://scotch-res.cloudinary.com/image/upload/w_1050,q_auto:good,f_auto/media/23785/x1iUe8FcSzmsF5rdQQfQ_DOGAE.png.jpg)

The project is deploying automaticly using [github actions](https://github.com/GoogleCloudPlatform/github-actions) to [Google Cloud App Engine](https://cloud.google.com/appengine)

First go to Google cloud console and create a new App Engine Project, then to deploy and add secrets you need to have gcloud local installed: [install](https://cloud.google.com/sdk), After it is installed run: 

```bash
# Login and set project
$ gcloud auth login
```

### Here are steps to deploy this for yourself:

This project is using github actions and secrets to deploy to App Engine, the guide on how to configure that is [here](https://github.com/GoogleCloudPlatform/github-actions/tree/master/appengine-deploy). Because App Engine does not support enviorment variables I choose to go with Google Secrets Manager to store my Mongodb Atlas connection string. Mongodb provides a free cluster for testing you can get that set up by following walkthrough [here](https://docs.atlas.mongodb.com/getting-started/). Once you have your cluster set up get your [connection string](https://docs.atlas.mongodb.com/tutorial/connect-to-your-cluster/#connect-to-your-atlas-cluster) and add that to a secret in Secrets Manager by running the following command after changing "Atlas Connection" to your Atlas Connection string.

```bash
# Set Secret
$ echo "Atlas Connection" | gcloud secrets create DB_HOST --replication-policy=automatic
```

Once the secret is set it's time to deploy the project. A App Engine project needs a app.yaml file, this project's file contains:

```yaml
# We are building from a docker container so we need a custom runtime
runtime: custom
# Flex is better for scalling instances of the api
env: flex

# Settings
manual_scaling:
  instances: 1
resources:
  cpu: 1
  memory_gb: 0.5
  disk_size_gb: 10
```

Make sure that you are in the api directory and then to deploy run:

```bash
# Deploy!
$ gcloud app deploy
```

Type `y` when prompted `Do you want to continue (Y/n)` y 

It will take a few minutes to build the project and deploy it. If everything worked you should see the url where the service was deployed to. Run:

```bash
# Deploy!
$ gcloud app browse
```

To open the deployed api. This will take you to your Graphql-Playground.

## Graphql 🔗

The project is using graphql and it is easily testable using the [Graphql-Playground](https://github.com/prisma-labs/graphql-playground). To access locally go to http://localhost:4000/ which is how this project is setup by default, to this project's live api and test out some commands go to https://graphqlchatgcp.uc.r.appspot.com/.

![Graphql-Playground](https://drive.google.com/uc?id=1J9H7HH0Uivi2YhrygqMImx1W4JmiYjyN)

First lets make a user:
```js
mutation {
  addUser (
    username: "Cool Username"
  ){
    _id
    username
  }
}
```
Copy the _id feild

Now that we have a user lets post a message:
Paste your user _id feild into the userId feild for the message.
```js
mutation {
  addMessage (
    text: "Cool Message"
    userId: "..."
    username: "Cool Username"
  ){
    _id
    text
    userId
    username
  }
}
```

Now that we have have made a user and posted a message lets retrieve that information.

This will show us a list of all users stored in the database.
```js
query {
  users {
    _id
    username
  }
}
```

Now lets look at the messages
```js
query {
  messages {
    _id
    text
    userId
    username
  }
}
```

This project is also set up with subscriptions using PubSub:

To try this out open two windows of Graphql-Playground,

In the first run
```js
subscription {
  messages {
    _id
    text
    userId
    username
  }
}
```

Now that we have a subscription running lets post a message:
```js
subscription {
  messages {
    _id
    text
    userId
    username
  }
}
```
You should see the information update live in the subscription view! 😎

## React Native 🚀

![React Native](https://miro.medium.com/max/3840/1*LXpGTyzXZy_P5A25toQ5LA.png)

### The client of the project uses a React native expo app.

### File structure 📁

- `assets`: Images for the app icon
- `src`: Main screens as well as,
- `src\components`: The messages component
- `src\constants`: Graphql queries 
- `./App.json`: Configuration for Expo
- `./app.config.js`: constants for connecting to the API


As stated in the Local Development section the `app.config.js` file contains the connection strings to the api.

Change the strings to match to the api endpoint that you want to connect to.

```js
export default ({config}) => {
  return Object.assign(config,
    {
      extra: {
        WSHOST: 'web socket api string',
        HTTPHOST: 'http api string'
      }
    });
};
```

The project is using Secrets Manager and to access the value there is an async main method in `app\index.js` to change that value to your own secret change the line

```js
// To access your secret change graphqlchatgcp to your project id
const name = 'projects/graphqlchatgcp/secrets/DB_HOST/versions/1';
```

this should look like:

```js
// To access your secret change graphqlchatgcp to your project id
const name = 'projects/{{ Your Project ID }}/secrets/DB_HOST/versions/1';
```

To test this on your device download the [expo app](https://expo.io/tools#client)

Run:

```bash
$ cd app
$ npm dev
```
This opens Metro Bundler which looks like

![Metro Bundler](https://drive.google.com/uc?id=1IPmAdMwIBC34C-wN0UA9FlL2PWbIUuV6)

From here you are able to scan the qr code from the app on Android or use the link on IOS.