package main

import (
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gorilla/mux"
	auth "github.com/onelittlenightmusic/opa-entrypoint-authorizer"
	"github.com/onelittlenightmusic/opa-entrypoint-authorizer/example-graphql/graph"
	"github.com/onelittlenightmusic/opa-entrypoint-authorizer/example-graphql/graph/generated"
)

const defaultPort = "8008"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	myRouter := mux.NewRouter().StrictSlash(true)
	initMiddleware, fieldMiddleware := Init()
	myRouter.Use(initMiddleware)

	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}}))
	// srv.AroundOperations(func(ctx context.Context, next graphql.OperationHandler) graphql.ResponseHandler {
	// 	// ops := graphql.GetOperationContext(ctx)
	// 	// jsonStr, _ := json.MarshalIndent(ops, "", "    ")
	// 	// fmt.Printf("AroundOperations: %s", jsonStr)
	// 	return next(ctx)
	// })
	srv.AroundFields(fieldMiddleware)

	myRouter.Handle("/", playground.Handler("GraphQL playground", "/query"))
	myRouter.Handle("/query", srv)

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, myRouter))
}

func Init() (func(h http.Handler)(http.Handler), graphql.FieldMiddleware){
	config := auth.MiddlewareConfiguration {
		DataPath: "./data",
		BundlePath: "../../bundle-raw.tar.gz",
	}
	return auth.CreateGraphQLMiddleware(config)
}