# 🚀 Instrucciones para Iniciar el Backend

## Paso 1: Instalar Dependencias

Abre una terminal en la carpeta `backend`:

```bash
cd backend
npm install
```

Esto instalará todas las dependencias necesarias (~150 MB).

## Paso 2: Configurar Variables de Entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

O crea manualmente un archivo `.env` con este contenido:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartrent
JWT_SECRET=mi_secret_super_seguro_para_desarrollo_12345
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=mi_refresh_secret_super_seguro_12345
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Paso 3: Iniciar MongoDB

**Opción A: MongoDB Local**
Si tienes MongoDB instalado localmente:
```bash
mongod
```

**Opción B: MongoDB Atlas (Recomendado)**
1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Configura acceso de red (permite tu IP o 0.0.0.0/0 para desarrollo)
4. Crea un usuario de base de datos
5. Obtén la cadena de conexión y actualiza `MONGODB_URI` en `.env`:
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/smartrent?retryWrites=true&w=majority
```

**Opción C: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Paso 4: Iniciar el Servidor

```bash
npm run dev
```

Deberías ver algo como:

```
[info]: ✅ Dependencias registradas
[info]: ✅ Conectado a MongoDB exitosamente
[info]: 🚀 Servidor corriendo en puerto 5000
[info]: 🌍 Entorno: development
[info]: 📡 API disponible en: http://localhost:5000/api/v1
```

## Paso 5: Poblar la Base de Datos (Opcional pero Recomendado)

Ejecuta el seeder para crear usuarios de prueba:

```bash
npm run seed
```

Esto creará 4 usuarios:
- **Admin**: admin@smartrent.com / Admin123
- **Usuario 1**: juan.perez@example.com / User123
- **Usuario 2**: maria.lopez@example.com / User123
- **Usuario 3 (Inactivo)**: carlos.ruiz@example.com / User123

## Paso 6: Probar la API

### 6.1 Health Check

```bash
curl http://localhost:5000/api/v1/health
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2026-01-22T..."
}
```

### 6.2 Hacer Login

**Ahora simplemente usa las credenciales del seeder:**

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartrent.com",
    "password": "Admin123"
  }'
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@smartrent.com",
      "role": "admin",
      "fullName": "Administrador Principal",
      ...
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Guarda el `accessToken` para las siguientes peticiones.**

### 6.3 Obtener Info del Usuario Actual

```bash
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_AQUI"
```

### 6.4 Crear un Nuevo Usuario (Como Admin)

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "inquilino@example.com",
    "password": "Password123",
    "role": "user",
    "fullName": "Juan Pérez",
    "phone": "987654321"
  }'
```

## 🧪 Probar con Postman o Thunder Client

### Importar Collection

Crea una collection en Postman con estos endpoints:

1. **Health Check**
   - GET http://localhost:5000/api/v1/health

2. **Login**
   - POST http://localhost:5000/api/v1/auth/login
   - Body (JSON):
   ```json
   {
     "email": "admin@smartrent.com",
     "password": "Admin123"
   }
   ```

3. **Get Me**
   - GET http://localhost:5000/api/v1/auth/me
   - Headers: `Authorization: Bearer {{token}}`

4. **Register User**
   - POST http://localhost:5000/api/v1/auth/register
   - Headers: `Authorization: Bearer {{token}}`
   - Body (JSON):
   ```json
   {
     "email": "nuevo@example.com",
     "password": "Password123",
     "role": "user",
     "fullName": "Nombre Completo",
     "phone": "987654321"
   }
   ```

5. **Refresh Token**
   - POST http://localhost:5000/api/v1/auth/refresh
   - Body (JSON):
   ```json
   {
     "refreshToken": "{{refreshToken}}"
   }
   ```

## ❌ Solución de Problemas

### Error: Cannot find module '@domain/...'

Asegúrate de que estás ejecutando con `ts-node-dev` que soporta path aliases:
```bash
npm run dev
```

### Error: connect ECONNREFUSED 127.0.0.1:27017

MongoDB no está corriendo. Inicia MongoDB:
- Local: `mongod`
- Docker: `docker start mongodb`
- O usa MongoDB Atlas

### Error: JWT_SECRET is not defined

Asegúrate de tener el archivo `.env` en la raíz de `backend/`

### Puerto 5000 ya en uso

Cambia el puerto en `.env`:
```env
PORT=5001
```

## 📝 Logs

Los logs se guardan en:
- `backend/logs/error.log` - Solo errores
- `backend/logs/combined.log` - Todos los logs

Para ver logs en tiempo real:
```bash
tail -f logs/combined.log
```

## ✅ Verificación Final

Si todo está bien, deberías poder:

- ✅ Ver "API funcionando correctamente" en /health
- ✅ Hacer login con credenciales válidas
- ✅ Obtener tu información en /auth/me
- ✅ Crear nuevos usuarios (solo como admin)
- ✅ Ver logs en la consola
- ✅ No ver errores de conexión a MongoDB

## 🎉 ¡Listo!

El backend del Sprint 1 está funcionando. Puedes continuar con:
- Crear un seeder para datos de prueba
- Implementar el frontend
- Agregar más endpoints según el backlog

---

**¿Problemas?** Revisa los logs o contacta al equipo.
