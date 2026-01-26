# SmartRent Backend 🏢

Backend del Sistema de Gestión de Departamentos implementado con **Clean Architecture**.

## 🏗️ Arquitectura

Este proyecto sigue los principios de Clean Architecture, organizado en 4 capas:

```
backend/src/
├── domain/              🔵 Capa de Dominio (Core)
│   ├── entities/        - Entidades del negocio
│   ├── repositories/    - Interfaces de repositorios
│   └── value-objects/   - Objetos de valor
├── application/         🟢 Capa de Aplicación
│   ├── use-cases/       - Casos de uso
│   ├── dto/             - Data Transfer Objects
│   ├── mappers/         - Mappers entre capas
│   └── interfaces/      - Interfaces de servicios
├── infrastructure/      🟡 Capa de Infraestructura
│   ├── database/        - Configuración de MongoDB
│   ├── repositories/    - Implementación de repositorios
│   └── services/        - Servicios externos
├── presentation/        🔴 Capa de Presentación
│   ├── controllers/     - Controladores HTTP
│   ├── routes/          - Rutas de la API
│   ├── middleware/      - Middleware de Express
│   └── validators/      - Validaciones
├── shared/              - Código compartido
│   ├── errors/          - Errores personalizados
│   └── utils/           - Utilidades
└── container/           - Inyección de dependencias
```

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
cd backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartrent
JWT_SECRET=tu_secret_super_seguro
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173
```

4. **Iniciar servidor en desarrollo**
```bash
npm run dev
```

## 📜 Scripts Disponibles

```bash
npm run dev          # Iniciar en modo desarrollo (hot reload)
npm run build        # Compilar TypeScript a JavaScript
npm start            # Iniciar servidor en producción
npm test             # Ejecutar tests
npm run test:watch   # Ejecutar tests en modo watch
npm run test:coverage # Ejecutar tests con cobertura
npm run lint         # Ejecutar linter
npm run lint:fix     # Ejecutar linter y corregir automáticamente
npm run seed         # Ejecutar seeders (datos de prueba)
```

## 🔐 Autenticación

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@smartrent.com",
  "password": "Admin123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@smartrent.com",
      "role": "admin",
      "fullName": "Administrador"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Registro (Solo Admin)
```http
POST /api/v1/auth/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "inquilino@example.com",
  "password": "Password123",
  "role": "user",
  "fullName": "Juan Pérez",
  "phone": "987654321"
}
```

### Refrescar Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

### Obtener Usuario Actual
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

## 🛠️ Tecnologías

- **Node.js 22.x** - Runtime de JavaScript
- **TypeScript** - Superset tipado de JavaScript
- **Express** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación con tokens
- **Bcrypt** - Hash de passwords
- **Winston** - Logger
- **TSyringe** - Inyección de dependencias
- **Helmet** - Seguridad HTTP
- **CORS** - Manejo de CORS
- **Express Validator** - Validación de datos

## 🎯 Patrones Implementados

- **Clean Architecture** - Separación en capas
- **Dependency Injection** - TSyringe
- **Repository Pattern** - Abstracción de datos
- **Use Case Pattern** - Lógica de negocio
- **DTO Pattern** - Transferencia de datos
- **Mapper Pattern** - Conversión entre capas
- **Factory Pattern** - Creación de entities
- **Value Object** - Email, Password

## 📁 Estructura de Archivos Importante

```
backend/
├── src/
│   ├── server.ts              # Punto de entrada
│   ├── container/index.ts     # Registro de dependencias
│   ├── domain/
│   │   ├── entities/User.entity.ts
│   │   ├── repositories/IUserRepository.ts
│   │   └── value-objects/
│   │       ├── Email.vo.ts
│   │       └── Password.vo.ts
│   ├── application/
│   │   ├── use-cases/auth/
│   │   │   ├── LoginUseCase.ts
│   │   │   ├── RegisterUseCase.ts
│   │   │   └── RefreshTokenUseCase.ts
│   │   ├── dto/UserDTO.ts
│   │   ├── mappers/UserMapper.ts
│   │   └── interfaces/
│   │       ├── IPasswordHashService.ts
│   │       └── IJWTService.ts
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── mongoose.config.ts
│   │   │   └── schemas/User.schema.ts
│   │   ├── repositories/UserRepository.ts
│   │   └── services/
│   │       ├── BcryptService.ts
│   │       └── JWTService.ts
│   └── presentation/
│       ├── controllers/AuthController.ts
│       ├── routes/
│       │   ├── index.ts
│       │   └── auth.routes.ts
│       ├── middleware/
│       │   ├── auth.middleware.ts
│       │   ├── roles.middleware.ts
│       │   ├── error.middleware.ts
│       │   └── validation.middleware.ts
│       └── validators/auth.validator.ts
├── package.json
├── tsconfig.json
└── .env.example
```

## 🧪 Testing

Los tests se organizan en tres categorías:

```
backend/tests/
├── unit/              # Tests unitarios (entities, use cases)
├── integration/       # Tests de integración (API)
└── e2e/               # Tests end-to-end
```

Ejecutar tests:
```bash
npm test                    # Todos los tests
npm run test:watch         # Modo watch
npm run test:coverage      # Con cobertura
```

## 🔒 Seguridad

- ✅ Passwords hasheados con bcrypt (10 rounds)
- ✅ JWT con expiración (7 días access, 30 días refresh)
- ✅ Helmet para headers de seguridad
- ✅ Rate limiting (100 req/15 min)
- ✅ CORS configurado
- ✅ Validación de todos los inputs
- ✅ Sanitización de datos
- ✅ MongoDB injection prevention (Mongoose)

## 📝 Logs

Los logs se almacenan en:
- `logs/error.log` - Solo errores
- `logs/combined.log` - Todos los logs

## 🐛 Manejo de Errores

Todos los errores se manejan de forma centralizada con clases personalizadas:

- `AppError` - Error base
- `ValidationError` (400) - Errores de validación
- `UnauthorizedError` (401) - No autenticado
- `ForbiddenError` (403) - No autorizado
- Mongoose errors manejados automáticamente

## 🚀 Despliegue

### Render.com (Recomendado)

1. Crear cuenta en [Render.com](https://render.com)
2. Crear nuevo Web Service
3. Conectar repositorio de GitHub
4. Configurar:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Variables de entorno (ver `.env.example`)

## 📚 Documentación Adicional

- [Guía de Clean Architecture](../CLEAN_ARCHITECTURE_GUIDE.md)
- [Product Backlog](../BACKLOG.md)
- [Planificación de Sprints](../SPRINTS.md)

## 👥 Contribuir

1. Fork el proyecto
2. Crear una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

MIT

---

**Desarrollado con ❤️ siguiendo Clean Architecture**
