package authz

is_owner {
  is_rest
  get_accessed_type.whoOwnsInArgs
  input.who == input.args[get_accessed_type.whoOwnsInArgs]
}