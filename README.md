# opa-entrypoint-authorizer

Single authorization configuration and middleware for both REST and GraphQL. Authorization policies are written by OPA Rego language and a new policy can be added.

## Configuration

Before starting this authorizer, we need the following configurations.

- Permission file (`permissions.json`)
  - `user_roles`: Persons who is assigned roles.
  - `role_permissions`: Permissions assigned to each role.

```json
{
  "user_roles": {
    "alice": ["admin"]
  },
  "role_permissions": {
    "admin": [
      {"resources": ["user"], "verbs": ["getname", "list"]}
    ]
  }
}
```

## Examples

### REST with Express

- `entrypointSetting`: Describe what permission is required for accessing each entrypoints

```js

const { restExpressOPAAuthorizer } = require('opa-entrypoint-authorizer')

// Setting for each entrypoint
const entrypointSetting = {
  type: "REST",
  restEntrypoints: [
    { "path": "/users", "method": "GET", require: {resource: "user", verb: "list"}},
    { "pathPattern": "/users/:user_name", "method": "GET", require: {resource: "user", verb: "getname", whoOwnsInArgs: "user_name"}},
    { "pathRegex": "^/+users/([^/]+)/age", "method": "GET", require: {resource: "user", verb: "getage", whoOwnsInArgs: "user_name"}},
    { "path": "/offices", "method": "GET", require: {resource: "office", verb: "list"}},
  ]
}

//Definition of REST API for Express
app.get('/users', middleware, function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end( JSON.stringify(dataUsers.map((x)=>({name: x.name}))) );
})

// Run Express service with authorization middleware
var server = app.listen(8081)
```

Please check [examples](https://github.com/onelittlenightmusic/opa-entrypoint-authorizer/tree/main/examples/rest-express)

### GraphQL with Apollo

- `entrypointSetting`: Describe what permission is required for accessing each entrypoints

```js
const { graphqlOPAAuthorizer } = require('opa-entrypoint-authorizer')

// Setting for each entrypoint
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

const schema = makeExecutableSchema({ typeDefs, resolvers })

// Run GraphQL service with authorization middleware
const server = new ApolloServer({
  schema: applyMiddleware(schema, graphqlOPAAuthorizer('policy.wasm', {permissions, entrypointSetting})),
  context: ({ req }) => ({ user: req.headers.authorization || '' }),
})
```

Please check [examples](https://github.com/onelittlenightmusic/opa-entrypoint-authorizer/tree/main/examples/graphql-apollo)

