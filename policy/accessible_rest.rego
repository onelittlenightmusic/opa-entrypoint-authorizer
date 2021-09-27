package authz

get_accessed_type = y {
  is_rest
  entrypoint := entrypoints[_]
  match_accessed_type_rest_path(entrypoint)
  y = entrypoint.require
}

match_accessed_type_rest_path(entrypoint) {
  entrypoint.path
  entrypoint.path == input.path
  entrypoint.method == input.method
} else {
  entrypoint.pathPattern
  entrypoint.pathPattern == input.pathPattern
  entrypoint.method == input.method
} else {
  entrypoint.pathRegex
  regex.match(entrypoint.pathRegex, input.path)
  entrypoint.method == input.method
}