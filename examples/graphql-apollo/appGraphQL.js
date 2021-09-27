const { ApolloServer } = require('apollo-server')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { applyMiddleware} = require('graphql-middleware')
const { graphqlOPAAuthorizer } = require('opa-entrypoint-authorizer')
var fs = require("fs");

const readJson = (fileName) => {
  let rawdata = fs.readFileSync(fileName);
  return JSON.parse(rawdata);
}

const dataUsers = [
  {name: "alice", age: 50},
  {name: "bob", age: 30},
  {name: "chris", age: 20},
]
const dataOffices = [
  {name: "santa clara", floor: 5},
]

//Definition of GraphQL service
const typeDefs = `
type Query {
  user(name: String): User
  users: [User]
  offices: [Office]
}
type User {
  name: String
  age: Int
}
type Office {
  name: String
  floor: Int
}
`

const resolvers = {
  Query: {
    user: (root, args, context, info) => {
      return dataUsers.find((x) => (x.name == args.name));
    },
    users: (root, args, context, info) => {
      return dataUsers;
    },
    offices: (root, args, context, info) => {
      return dataOffices;
    },
  },
  User: {
    name: (root, args, context, info) => root.name,
    age: (root, args, context, info) => root.age,
  },
  Office: {
    name: (root, args, context, info) => root.name,
    floor: (root, args, context, info) => root.floor,
  }
}

//Definition of authorization
const permissions = readJson('permissions.json')

//Definition of entrypoint settings
const entrypointSetting = {
  type: "GraphQL",
  graphqlEntrypoints: {
    Query: {
      user: {resource: "user", verb: "getname", whoOwnsInArgs: "name"},
      users: {resource: "user", verb: "list"},
      offices: {resource: "office", verb: "list"},
    },
    User: {
      name: {resource: "user", verb: "getname"},
      age: {resource: "user", verb: "getage"},
      whoOwnsInField: "name",
    },
    Office: {
      name:  {resource: "office", verb: "get"},
      floor:  {resource: "office", verb: "get"},
    }
  }
}

// Run GraphQL service with authorization middleware
const schema = makeExecutableSchema({ typeDefs, resolvers })

const server = new ApolloServer({
  schema: applyMiddleware(schema, graphqlOPAAuthorizer('../../policy.wasm', {permissions, entrypointSetting})),
  context: ({ req }) => ({ user: req.headers.authorization || '' }),
})

server.listen({ port: 8008 })