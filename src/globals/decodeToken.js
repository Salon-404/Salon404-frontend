import { jwtDecode } from "jwt-decode";

function getClaim(decoded, keys, matcher) {
  for (const key of keys) {
    if (decoded[key] != null) return decoded[key];
  }

  if (!matcher) return undefined;

  const entry = Object.entries(decoded).find(([key]) => matcher(key));
  return entry?.[1];
}

export function decodeToken(token) {
  try {
    const decoded = jwtDecode(token);
    const role = getClaim(
      decoded,
      [
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
        "role",
        "Role",
        "roles",
        "Roles",
        "rol",
        "Rol",
        "roleName",
        "RoleName",
        "role_name",
      ],
      (key) => /(^|\/)(role|roles|rol|roleName)$/i.test(key)
    );
    const roleId = getClaim(
      decoded,
      [
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/roleid",
        "roleId",
        "RoleId",
        "rolId",
        "RolId",
        "role_id",
        "rol_id",
      ],
      (key) => /(^|\/)(roleid|role_id|rolid|rol_id)$/i.test(key)
    );

    return {
      id: getClaim(
        decoded,
        [
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
          "id",
          "userId",
          "UserId",
          "sub",
        ],
        (key) => /(^|\/)(nameidentifier|userid)$/i.test(key)
      ),
      name: getClaim(
        decoded,
        [
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
          "name",
          "Name",
          "nombre",
        ],
        (key) => /(^|\/)(name|nombre)$/i.test(key)
      ),
      email: getClaim(
        decoded,
        [
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
          "email",
          "Email",
        ],
        (key) => /(^|\/)(email|emailaddress)$/i.test(key)
      ),
      role,
      roleId,
      raw: decoded,
    };
  }
  catch (error) {
    console.error("token invalido", error);
    return null;
  }

}
