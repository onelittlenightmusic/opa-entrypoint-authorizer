# Authorizer example for REST with Golang

Start a REST server.

```sh
go run main.go
```

Access the following URL sing REST client.

`http://localhost:8081`

## Test scenario

Access these endpoints 
- `http://localhost:8081/offices`
- `http://localhost:8081/users`
- `http://localhost:8081/users/{user_name}`
- `http://localhost:8081/users/{user_name}/age`


| Endpoint | Authorization header | Result |
|-|-|-|
| `http://localhost:8081/offices` | `alice` | Success (because this is public resource) |
| `http://localhost:8081/offices` | `bob` | Success (because this is public resource) |
| `http://localhost:8081/offices` | `chris` | Success (because this is public resource) |
| `http://localhost:8081/users` | `alice` | Success (because of role `admin`) |
| `http://localhost:8081/users` | `bob` | Success (because of role `namecheck`) |
| `http://localhost:8081/users` | `chris` | Failure |
| `http://localhost:8081/users/alice/age` | `alice` | Success (because of role `admin`) |
| `http://localhost:8081/users/alice/age` | `bob` | Failure |
| `http://localhost:8081/users/alice/age` | `chris` | Failure |
| `http://localhost:8081/users/bob/age` | `alice` | Success (because of role `admin`) |
| `http://localhost:8081/users/bob/age` | `bob` | Success (because it is owner) |
| `http://localhost:8081/users/bob/age` | `chris` | Failure |
| `http://localhost:8081/users/chris/age` | `alice` | Success (because of role `admin`) |
| `http://localhost:8081/users/chris/age` | `bob` | Failure |
| `http://localhost:8081/users/chris/age` | `chris` | Success (because it is owner) |
