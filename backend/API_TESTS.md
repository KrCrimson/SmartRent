# 🧪 Comandos de Prueba para la API

Este archivo contiene todos los comandos curl listos para probar la API de SmartRent.

## 📝 Preparación

1. Asegúrate de que el servidor esté corriendo: `npm run dev`
2. Ejecuta el seeder: `npm run seed`
3. Ten una terminal lista para ejecutar estos comandos

---

## 🏥 Health Check

```bash
curl http://localhost:5000/api/v1/health
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2024-01-22T..."
}
```

---

## 🔐 Autenticación

### Login como Admin

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartrent.com",
    "password": "Admin123"
  }'
```

**⚠️ IMPORTANTE: Guarda el `accessToken` y `refreshToken` de la respuesta**

### Login como Usuario Regular

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@example.com",
    "password": "User123"
  }'
```

### Intentar Login con Usuario Inactivo (Debe Fallar)

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos.ruiz@example.com",
    "password": "User123"
  }'
```

**Respuesta esperada:**
```json
{
  "success": false,
  "message": "Usuario inactivo",
  "statusCode": 403
}
```

### Intentar Login con Contraseña Incorrecta

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartrent.com",
    "password": "WrongPassword"
  }'
```

**Respuesta esperada:**
```json
{
  "success": false,
  "message": "Credenciales inválidas",
  "statusCode": 401
}
```

---

## 👤 Operaciones de Usuario

### Obtener Info del Usuario Actual

```bash
# 🚨 REEMPLAZA "TU_TOKEN_AQUI" con el accessToken que obtuviste del login
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Obtener Info sin Token (Debe Fallar)

```bash
curl http://localhost:5000/api/v1/auth/me
```

**Respuesta esperada:**
```json
{
  "success": false,
  "message": "Token no proporcionado",
  "statusCode": 401
}
```

---

## 📝 Registro de Usuarios

### Crear Usuario como Admin

```bash
# 🚨 Debes estar logueado como ADMIN
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Authorization: Bearer TU_TOKEN_ADMIN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo.usuario@example.com",
    "password": "Password123",
    "role": "user",
    "fullName": "Nuevo Usuario Test",
    "phone": "955444333"
  }'
```

### Intentar Crear Usuario sin ser Admin (Debe Fallar)

```bash
# 🚨 Usa un token de usuario regular (role: user)
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Authorization: Bearer TU_TOKEN_USER_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "otro@example.com",
    "password": "Password123",
    "role": "user",
    "fullName": "Otro Usuario",
    "phone": "944333222"
  }'
```

**Respuesta esperada:**
```json
{
  "success": false,
  "message": "No tienes permisos para realizar esta acción",
  "statusCode": 403
}
```

### Intentar Crear Usuario con Email Duplicado

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Authorization: Bearer TU_TOKEN_ADMIN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartrent.com",
    "password": "Password123",
    "role": "user",
    "fullName": "Admin Duplicado",
    "phone": "933222111"
  }'
```

**Respuesta esperada:**
```json
{
  "success": false,
  "message": "El email ya está registrado",
  "statusCode": 409
}
```

---

## 🔄 Refresh Token

### Refrescar Token de Acceso

```bash
# 🚨 Usa el refreshToken que obtuviste en el login
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "TU_REFRESH_TOKEN_AQUI"
  }'
```

### Intentar Refrescar con Token Inválido

```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "token.invalido.xyz"
  }'
```

---

## 🚪 Logout

```bash
# 🚨 Usa el accessToken actual
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Nota:** Después del logout, el token ya no será válido.

---

## ⚠️ Casos de Validación

### Login sin Email

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "password": "Admin123"
  }'
```

**Respuesta esperada:**
```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "field": "email",
      "message": "El email es requerido"
    }
  ],
  "statusCode": 400
}
```

### Registro con Email Inválido

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Authorization: Bearer TU_TOKEN_ADMIN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "email-invalido",
    "password": "Password123",
    "role": "user",
    "fullName": "Test User",
    "phone": "999888777"
  }'
```

### Registro con Contraseña Corta

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Authorization: Bearer TU_TOKEN_ADMIN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123",
    "role": "user",
    "fullName": "Test User",
    "phone": "999888777"
  }'
```

---

## 🧪 Testing Workflow Completo

### Paso 1: Login como Admin

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartrent.com",
    "password": "Admin123"
  }' | jq
```

> Guarda el `accessToken` en una variable:

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Paso 2: Ver mi información

```bash
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Paso 3: Crear un nuevo usuario

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "inquilino@example.com",
    "password": "Inquilino123",
    "role": "user",
    "fullName": "Pedro Inquilino",
    "phone": "988777666"
  }' | jq
```

### Paso 4: Login con el nuevo usuario

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "inquilino@example.com",
    "password": "Inquilino123"
  }' | jq
```

### Paso 5: Intentar crear usuario siendo inquilino (debe fallar)

```bash
USER_TOKEN="token_del_inquilino_aqui"

curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "otro@example.com",
    "password": "Password123",
    "role": "user",
    "fullName": "Otro Usuario",
    "phone": "977666555"
  }' | jq
```

---

## 💡 Tips

1. **Instala jq para formatear JSON:**
   ```bash
   # Windows (con chocolatey)
   choco install jq
   
   # Mac
   brew install jq
   
   # Linux
   apt-get install jq
   ```

2. **Guarda tokens en variables:**
   ```bash
   # Extraer token automáticamente
   TOKEN=$(curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@smartrent.com","password":"Admin123"}' \
     | jq -r '.data.accessToken')
   
   echo $TOKEN
   ```

3. **Usa Postman o Thunder Client** para una experiencia más visual.

4. **Revisa los logs** en `backend/logs/` si algo falla.

---

## 📊 Códigos de Estado HTTP

| Código | Significado | Cuándo sucede |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa |
| 201 | Created | Usuario registrado exitosamente |
| 400 | Bad Request | Errores de validación |
| 401 | Unauthorized | Token inválido o credenciales incorrectas |
| 403 | Forbidden | Sin permisos o usuario inactivo |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Email ya registrado |
| 500 | Server Error | Error interno del servidor |

---

**¿Necesitas más tests?** Agrega tus propios casos aquí.
