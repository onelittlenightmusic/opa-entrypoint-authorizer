import { createServer } from 'http';
import { envelop, useLogger, useSchema, useTiming } from '@envelop/core';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { useOPAAuth, useFilterAllowedOperations } from './authorization';
import { readFileSync  } from 'fs';

import { graphqlEnvelopOPAAuthorizer } from 'opa-entrypoint-authorizer';

const dataUsers = [
  {name: "alice", age: 50},
  {name: "bob", age: 30},
  {name: "chris", age: 20},
]
const dataOffices = [
  {name: "santa clara", floor: 5},
]


const schema = makeExecutableSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      hello: String!
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
  `,
  resolvers: {
    Query: {
      hello: () => 'World',
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
  },
});

const readJson = (fileName) => {
  let rawdata = readFileSync(fileName);
  return JSON.parse(rawdata.toString('utf8'));
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
      hello: {resource: "hello", verb: "hello"}
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


const run = async () => {
  let authorizer = await graphqlEnvelopOPAAuthorizer('../../policy.wasm', {permissions, entrypointSetting});

  const getEnveloped = envelop({
    plugins: [useSchema(schema), useLogger(), useTiming(), useOPAAuth(), useFilterAllowedOperations(authorizer) ],
  });


  const server = createServer((req, res) => {
    const { parse, validate, contextFactory, execute, schema } = getEnveloped({ req });
    let payload = '';

    req.on('data', chunk => {
      payload += chunk.toString();
    });

    req.on('end', async () => {
      const { query, variables } = JSON.parse(payload);
      const document = parse(query);
      const validationErrors = validate(schema, document);

      if (validationErrors.length > 0) {
        res.end(
          JSON.stringify({
            errors: validationErrors,
          })
        );

        return;
      }

      const context = await contextFactory();
      const result = await execute({
        document,
        schema,
        variableValues: variables,
        contextValue: {
          ...context,
          user: context.req.headers.authorization
        }
      });

      res.end(JSON.stringify(result));
    });
  });

  server.listen(3000);
};

run();
