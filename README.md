# opa-entrypoint-authorizer

Plugin for Javascript or golang to enable single authorization configuration and middleware for both REST and GraphQL. 

Authorization policies are written by OPA Rego language and a new policy can be added.

## Supported framework

- JavaScript (node.js)
  - GraphQL: Apollo, Envelop (To be)
  - REST: Express
- Golang
  - GraphQL: gqlgen
  - REST: `http` and gorilla/mux

The following tools are used in this plugin.
- [@open-policy-agent/opa-wasm](https://github.com/open-policy-agent/npm-opa-wasm)(for JavaScript)
- [OPA](https://github.com/open-policy-agent/opa)(for Golang)

## Usage

- Create configuration as `permissions.json` (details in the next section)
- Import plugin
  ```js
  const { restExpressOPAAuthorizer } = require('opa-entrypoint-authorizer')
  ```
- Create middleware using plugin and configuration. Insert the middleware to frameworks.
  ```js
  const middleware = restExpressOPAAuthorizer('policy.wasm', {permissions, entrypointSetting})

  //Definition of REST API for Express
  app.get('/users', middleware, function (req, res) {...}
  ```

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

### (JavaScript) REST with Express

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

// Configure authorization middleware
const middleware = restExpressOPAAuthorizer('../../policy.wasm', {permissions, entrypointSetting})


//Definition of REST API for Express
app.get('/users', middleware, function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end( JSON.stringify(dataUsers.map((x)=>({name: x.name}))) );
})

// Run Express service with authorization middleware
var server = app.listen(8081)
```

Please check [examples](https://github.com/onelittlenightmusic/opa-entrypoint-authorizer/tree/main/examples/rest-express)

### (JavaScript) GraphQL with Apollo

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

### (Golang) REST with gorilla/mux

TBD

### (Golang) GraphQL with gqlgen

TBD

## Policy

### Policy for JavaScript

JavaScript requires policy wasm file `policy.wasm` (file name is arbitrary).

### Policy for Golang

Golang requires a policy bundle file `bundle.tar.gz`.

### Customize policy

TBD

### Build policy files

```sh
make build
```
