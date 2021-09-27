package authz

accessible(p) {
  accessed_type := get_accessed_type

  some i
  accessed_type.resource == p.resources[i]
  permitted_verb(accessed_type.verb, p)
}

permitted_verb(v, p) {
  not p.verbs
}

permitted_verb(v, p) {
  some j
  v == p.verbs[j]
}

