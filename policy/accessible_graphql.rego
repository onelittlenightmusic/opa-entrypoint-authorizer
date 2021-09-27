package authz

get_accessed_type = y {
  is_graphql
  y = entrypoints[input.parentType][input.fieldName]
}
