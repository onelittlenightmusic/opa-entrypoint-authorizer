package authz

# logic that implements RBAC.

allow {
    # lookup the list of roles for the user
    roles := data.permissions.user_roles[input.who]
    # for each role in that list
    r := roles[_]
    # lookup the permissions list for role r
    permissions := data.permissions.role_permissions[r]
    # for each permission
    p := permissions[_]
    # check if the permission granted to r matches the user's request
    accessible(p)
}
