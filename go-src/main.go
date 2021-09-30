package authorizer

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/99designs/gqlgen/graphql"
	"github.com/gorilla/mux"
	"github.com/open-policy-agent/opa/rego"
)

var query *rego.PreparedEvalQuery

type MiddlewareConfiguration struct {
	DataPath string
	BundlePath string
}

type GraphQLMiddleware graphql.FieldMiddleware

type AuthorizerInput map[string]interface{}

func loadPolicyQuery(config MiddlewareConfiguration) (error) {
	if query == nil {
		ctx := context.Background()
		q, err := rego.New(
			rego.Query("data.authz.allow"),
			rego.Load([]string{config.DataPath, config.BundlePath}, nil),
			).PrepareForEval(ctx)
		query = &q
		return err
	}
	return nil
}

func GetAuthResult(input AuthorizerInput) bool {
	jsonInputStr, err := json.Marshal(input)
	log.Printf("Input: %s", []byte(jsonInputStr))

	ctx := context.Background()
	
	results, err := query.Eval(ctx, rego.EvalInput(input))
	jsonStr, err := json.Marshal(results)
	log.Printf("Output: %s", []byte(jsonStr))
	if err != nil || len(results) == 0 || len(results[0].Expressions) == 0{
			log.Fatal(err)
			return false
	}
	// return true
	return results[0].Expressions[0].Value.(bool)
}


func RestMiddleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path, err := mux.CurrentRoute(r).GetPathTemplate()
		if err != nil {
			w.WriteHeader(400)
			w.Write([]byte("Bad request"))
			return			
		}

		if len(r.Header["Authorization"]) == 0 {
			w.WriteHeader(403)
			w.Write([]byte("Unauthorized: anonymous user is not allowed."))
			return
		}
		vars := mux.Vars(r)
		input := AuthorizerInput{
			"who": r.Header["Authorization"][0],
			"method": r.Method,
			"path": r.URL.Path,
			"pathPattern": path,
			"args": vars,
		}
		

		if !GetAuthResult(input) {
				w.WriteHeader(403)
				w.Write([]byte("Unauthorized"))
				return
		}
		h.ServeHTTP(w, r)
	})
}

var whoCtxKeyGraphQL = "who"

func GraphQLFieldMiddleware(ctx context.Context, next graphql.Resolver) (res interface{}, err error) {
	ops := graphql.GetFieldContext(ctx)

	object := ops.Parent.Result

	input := AuthorizerInput{
		"object": object,
		"args": ops.Args,
		"fieldName": ops.Field.Name,
		"parentType": ops.Object,
		"who": ctx.Value(whoCtxKeyGraphQL),
	}

	if !GetAuthResult(input) {
		return nil, fmt.Errorf("Unauthorized.") 
	}
	return next(ctx)
}

func GraphQLInitialMiddleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		if len(r.Header["Authorization"]) == 0 {
			w.WriteHeader(403)
			w.Write([]byte("Unauthorized: anonymous user is not allowed."))
			return
		}
		ctx := context.WithValue(r.Context(), whoCtxKeyGraphQL, r.Header["Authorization"][0])
		r = r.WithContext(ctx)
		h.ServeHTTP(w, r)
	})
}


func CreateRestMiddleware(config MiddlewareConfiguration) func(h http.Handler)(http.Handler) {
	loadPolicyQuery(config)
	return RestMiddleware
}

func CreateGraphQLMiddleware(config MiddlewareConfiguration) (func(h http.Handler)(http.Handler), graphql.FieldMiddleware) {
	loadPolicyQuery(config)
	return GraphQLInitialMiddleware, GraphQLFieldMiddleware
}