const { ApolloServer, PubSub, gql } = require('apollo-server');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const pubsub = new PubSub();
require('dotenv').config();

async function main() {
  // To access your secret change graphqlchatgcp to your project id
  const name = 'projects/graphqlchatgcp/secrets/DB_HOST/versions/1';
  const client = new SecretManagerServiceClient();
  async function accessSecretVersion() {
    try {
      const [accessResponse] = await client.accessSecretVersion({
        name: name
      });
      const responsePayload = accessResponse.payload.data.toString('utf8');
      next(responsePayload)
    } catch (error) {
      console.log(error);
      next(process.env.DB_HOST)
    }    
  }
  accessSecretVersion();
}

main();

function next(uri) {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  client.connect()
  .then(() => {
      console.log('Connection to DB successful');
      db = client.db("data");
  })
  .catch(err => {
      console.log('Db connection error ', err);
  });

const typeDefs = gql`
  type user {
    _id: ID!,
    username: String!
  }
  type message {
    _id: ID!,
    text: String!
    userId: String!
    username: String!
  }
  type Query {
    userById(userId: String!): user
    users: [user]
    messages: [message]
  }
  type Mutation {
    addUser(username: String!): user
    addMessage(text: String!, userId: String!, username: String!): message
  }
  type Subscription{
    messages: message
  }
`

const MESSAGE_ADDED = 'MESSAGE_ADDED';

const resolvers = {
  Query: {
      userById: async (_, input) => {
          user = await db.collection('users').find({_id : new ObjectId(input.userId)}).toArray().then(res => { return res });
          return user[0];
      },
      users: async () => {
          users = await db.collection('users').find().toArray().then(res => { return res });
          return users;
      },
      messages: async () => {
          messages = await db.collection('messages').find().toArray().then(res => { return res });
          return messages;
      }
  },
  Mutation: {
      addUser: async (_, input) => {
          try {
              const newUser = await  db.collection('users').insertOne(input);
              const normalizedInput = { '_id': newUser.ops[0]._id, 'username': newUser.ops[0].username};
              return normalizedInput;
          } catch (error) {
              return error;
          }
      },
      addMessage: async (_, input) => {
          try {
              const newMessge = await  db.collection('messages').insertOne(input);
              const normalizedInput = { '_id': newMessge.ops[0]._id, 'text': newMessge.ops[0].text, 'userId': newMessge.ops[0].userId, 'username': newMessge.ops[0].username};
              pubsub.publish(MESSAGE_ADDED, { messages: normalizedInput });
              return normalizedInput;
          } catch (error) {
              return error;
          }
      }
  },
  Subscription: {
      messages: {
          subscribe () {
              return pubsub.asyncIterator([MESSAGE_ADDED]);
          }
      }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen(process.env.PORT || 4000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
}