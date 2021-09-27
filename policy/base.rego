package authz

default allow = false

is_graphql {
  data.entrypointSetting.type == "GraphQL"
}

is_rest {
  data.entrypointSetting.type == "REST"
}

entrypoints = y {
  is_rest
  y = data.entrypointSetting.restEntrypoints
} else = y {
  is_graphql
  y = data.entrypointSetting.graphqlEntrypoints
}

policyInputMap = data.policyInputMap