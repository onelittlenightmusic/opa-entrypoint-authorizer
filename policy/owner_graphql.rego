package authz

is_owner {
  is_graphql
  field := entrypoints[input.parentType].whoOwnsInField

  input.who == input.object[field]
}

is_owner {
  is_graphql
  # ownedResources := policyInputMap.owner.ownedResources[_]
  # get_accessed_type.resource == ownedResources["ownedResource"]

  # input.who == input.args[ownedResources["whoIsOwnerInFieldArg"]]
  get_accessed_type.whoOwnsInArgs
  input.who == input.args[get_accessed_type.whoOwnsInArgs]
}