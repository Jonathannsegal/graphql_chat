const { createServer } = require('node:http')
const { createSchema, createYoga, createPubSub } = require('graphql-yoga')
const { MongoClient, ObjectId } = require('mongodb')
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager')
require('dotenv').config()

const pubSub = createPubSub()

const typeDefs = /* GraphQL */ `
  type User { _id: ID!, username: String! }
  type Message { _id: ID!, text: String!, userId: String!, username: String! }
  type Query { userById(userId: String!): User, users: [User!]!, messages: [Message!]! }
  type Mutation {
    addUser(username: String!): User!
    addMessage(text: String!, userId: String!, username: String!): Message!
  }
  type Subscription { messages: Message! }
`

async function getMongoUri() {
  if (process.env.DB_HOST) return process.env.DB_HOST
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'graphqlchatgcp'
  const name = `projects/${projectId}/secrets/DB_HOST/versions/latest`
  const [version] = await new SecretManagerServiceClient().accessSecretVersion({ name })
  return version.payload.data.toString('utf8')
}

async function start() {
  const mongo = new MongoClient(await getMongoUri())
  await mongo.connect()
  const db = mongo.db('data')

  const resolvers = {
    Query: {
      userById: async (_, { userId }) => db.collection('users').findOne({ _id: new ObjectId(userId) }),
      users: async () => db.collection('users').find().toArray(),
      messages: async () => db.collection('messages').find().toArray(),
    },
    Mutation: {
      addUser: async (_, input) => {
        const result = await db.collection('users').insertOne(input)
        return { _id: result.insertedId, ...input }
      },
      addMessage: async (_, input) => {
        const result = await db.collection('messages').insertOne(input)
        const message = { _id: result.insertedId, ...input }
        pubSub.publish('messages', { messages: message })
        return message
      },
    },
    Subscription: {
      messages: { subscribe: () => pubSub.subscribe('messages') },
    },
  }

  const yoga = createYoga({ schema: createSchema({ typeDefs, resolvers }) })
  createServer(yoga).listen(process.env.PORT || 4000, () => {
    console.log(`GraphQL Chat API ready at http://localhost:${process.env.PORT || 4000}/graphql`)
  })
}

start().catch(error => {
  console.error('Unable to start GraphQL Chat API:', error)
  process.exitCode = 1
})
