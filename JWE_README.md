# JWE (JSON Web Encryption) Implementation

Este proyecto ahora usa JWE para cifrar los tokens JWT, proporcionando confidencialidad además de integridad y autenticidad.

## Configuración

1. **Claves de cifrado**: Se generan automáticamente en el directorio `/keys/`
   - `private.pem`: Clave privada para descifrar tokens
   - `public.pem`: Clave pública para cifrar tokens

2. **Variables de entorno**:
   ```env
   JWE_PRIVATE_KEY_PATH=./keys/private.pem
   JWE_PUBLIC_KEY_PATH=./keys/public.pem
   ```

## Cómo funciona

### Login
1. El usuario envía `email` y `password`
2. El backend valida las credenciales
3. Se genera un token JWE cifrado con los datos del usuario
4. El token se devuelve al frontend

### Peticiones autenticadas
1. El frontend envía el token JWE en el header `Authorization: Bearer <token>`
2. El `JweAuthGuard` descifra el token y extrae los datos del usuario
3. Los datos se asignan a `req.user` para uso en controladores

### Seguridad
- **Confidencialidad**: El payload está cifrado con RSA-OAEP-256
- **Integridad**: Se verifica que el token no ha sido modificado
- **Autenticidad**: Se valida el issuer y audience
- **Expiración**: Los tokens expiran automáticamente (15 minutos por defecto)

## Migración desde JWT

Los controladores ahora usan `JweAuthGuard` en lugar de `JwtAuthGuard`:

```typescript
@UseGuards(JweAuthGuard)  // ← Antes era JwtAuthGuard
```

El frontend no necesita cambios - sigue enviando el token como string.

## Notas de seguridad

⚠️ **IMPORTANTE**: 
- Las claves en `/keys/` NO deben subirse al repositorio
- Usar HTTPS en producción
- Regenerar las claves periódicamente
- Mantener la clave privada segura
