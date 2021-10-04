package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/onelittlenightmusic/opa-entrypoint-authorizer/example-graphql/graph/generated"
	"github.com/onelittlenightmusic/opa-entrypoint-authorizer/example-graphql/graph/model"

	"github.com/vektah/gqlparser/v2/gqlerror"
)

func (r *queryResolver) Users(ctx context.Context) ([]*model.User, error) {
	return Users, nil
}

func (r *queryResolver) User(ctx context.Context, name string) (*model.User, error) {
	for _, u := range Users {
		if u.Name == name {
			return u, nil
		}
	}
	return nil, gqlerror.Errorf("Resource not found.")
}

func (r *queryResolver) Offices(ctx context.Context) ([]*model.Office, error) {
	return Offices, nil
}

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type queryResolver struct{ *Resolver }
