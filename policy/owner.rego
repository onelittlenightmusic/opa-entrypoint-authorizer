package authz

allow {
    p := data.permissions.owner_permissions[_]
    accessible(p)
    # If you're the user, it is ok to refer to user data.
    is_owner
}

