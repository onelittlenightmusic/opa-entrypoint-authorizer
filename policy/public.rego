package authz

allow {
    p := data.permissions.public_permissions[_]
    accessible(p)
}
