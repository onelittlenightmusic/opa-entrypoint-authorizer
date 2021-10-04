module github.com/onelittlenightmusic/opa-entrypoint-authorizer/example-graphql

go 1.16

require (
	github.com/99designs/gqlgen v0.14.0
	github.com/gorilla/mux v1.8.0
	github.com/onelittlenightmusic/opa-entrypoint-authorizer v0.0.0-20210927065352-fdda06857b9c
	github.com/vektah/gqlparser/v2 v2.2.0
)

replace github.com/onelittlenightmusic/opa-entrypoint-authorizer => ../../
