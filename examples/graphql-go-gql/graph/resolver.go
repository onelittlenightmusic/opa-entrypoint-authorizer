package graph

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.
import (
	"github.com/onelittlenightmusic/opa-entrypoint-authorizer/example-graphql/graph/model"
)

type Resolver struct{}

var (
	Users []*model.User = []*model.User{
		{Name: "alice", Age: 50},
		{Name: "bob", Age: 30},
		{Name: "chris", Age: 20},
	}
	Offices []*model.Office = []*model.Office{
		{Name: "santa clara", Floor: 5},
	}
)
