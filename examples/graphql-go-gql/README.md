# Authorizer example for GraphQL with gqlgen

Start a REST server.

```sh
go run server.go
```

Access the following URL sing REST client.

`http://localhost:8008`

## Test scenario

Access these queries
```
query a {
  offices {
    name
    floor
  }
  users {
    name
    age
  }
  alice: user(name: "alice") {
    name
    age
  }
  bob: user(name: "bob") {
    name
    age
  }
  chris: user(name: "chris") {
    name
    age
  }
}
```


| Query | Authorization header | Result |
|-|-|-|
| `{offices{<any field>}}` | `alice` | Success (because this is public resource) |
| `{offices{<any field>}}` | `bob` | Success (because this is public resource) |
| `{offices{<any field>}}` | `chris` | Success (because this is public resource) |
| `{users{name}}` | `alice` | Success (because of role `admin`) |
| `{users{name}}` | `bob` | Success (because of role `namecheck`) |
| `{users{name}}` | `chris` | Failure |
| `{user(name: "alice"){age}}` | `alice` | Success (because of role `admin`) |
| `{user(name: "alice"){age}}` | `bob` | Failure |
| `{user(name: "alice"){age}}` | `chris` | Failure |
| `{user(name: "bob"){age}}` | `alice` | Success (because of role `admin`) |
| `{user(name: "bob"){age}}` | `bob` | Success (because it is owner) |
| `{user(name: "bob"){age}}` | `chris` | Failure |
| `{user(name: "chris"){age}}` | `alice` | Success (because of role `admin`) |
| `{user(name: "chris"){age}}` | `bob` | Failure |
| `{user(name: "chris"){age}}` | `chris` | Success (because it is owner) |