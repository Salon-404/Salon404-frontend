import { jwtDecode } from "jwt-decode";
import { usuariosMock } from "../mocks/authMock";

export function decodeToken(token)
{
    // Detectar token mock
    if (token && token.startsWith('mock_token_')) {
      const partes = token.split('_')
      const id = parseInt(partes[2])
      const usuario = usuariosMock.find(u => u.id === id)
      if (!usuario) return null
      return {
        id: usuario.id,
        name: usuario.nombre,
        email: usuario.email,
        role: usuario.rol
      }
    }
    
    try
    {
     const decoded = jwtDecode(token);
     return {
      id: decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ],
      name: decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
      ],
      email: decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ],
      role: decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ]
    };
    }
    catch(error)
    {
      console.error("token invalido",error);
      return null;
    }

}