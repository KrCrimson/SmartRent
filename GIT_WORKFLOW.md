# 🌿 Estrategia de Ramas Git - SmartRent

## Estructura de Ramas

```
main (producción)
│
├── develop (integración)
│   │
│   ├── feature/HU-005-crud-departamentos
│   ├── feature/HU-006-subida-imagenes
│   ├── feature/HU-007-galeria-publica
│   ├── feature/HU-008-vista-detallada
│   ├── feature/HU-009-panel-admin
│   ├── feature/HU-010-crud-usuarios
│   └── ... (más features)
│
└── hotfix/nombre-del-fix (solo para bugs críticos en producción)
```

## Convenciones de Nombres

### Ramas de Feature
```bash
feature/HU-XXX-descripcion-corta
```

Ejemplos:
- `feature/HU-005-crud-departamentos`
- `feature/HU-006-subida-imagenes`
- `feature/HU-010-crud-usuarios`

### Ramas de Hotfix
```bash
hotfix/descripcion-del-bug
```

Ejemplo:
- `hotfix/fix-login-timeout`
- `hotfix/mongodb-connection-error`

## Workflow

### 1. Iniciar una nueva Historia de Usuario

```bash
# Asegúrate de estar en develop actualizado
git checkout develop
git pull origin develop

# Crear rama para la nueva feature
git checkout -b feature/HU-XXX-descripcion

# Trabajar en la feature...
# Hacer commits atómicos
```

### 2. Commits Semánticos

Usa el formato [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat(departamentos): agregar endpoint POST /departments"
git commit -m "fix(auth): corregir validación de token expirado"
git commit -m "docs(readme): actualizar instrucciones de instalación"
git commit -m "refactor(users): simplificar lógica de mapeo"
git commit -m "test(auth): agregar tests para login"
```

**Tipos de commit:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formato, punto y coma faltante, etc (sin cambios de código)
- `refactor`: Refactorización de código
- `test`: Agregar tests
- `chore`: Actualizar dependencias, configuración, etc

### 3. Push de la Feature

```bash
# Asegúrate de que todo compile y funcione
npm run build
npm test

# Push a origin
git push -u origin feature/HU-XXX-descripcion
```

### 4. Pull Request

1. Ve a GitHub
2. Crea Pull Request de `feature/HU-XXX-descripcion` → `develop`
3. Título: `[HU-XXX] Descripción de la feature`
4. Descripción detallada:
   ```markdown
   ## Descripción
   Implementación de [descripción]
   
   ## Cambios
   - Agregado endpoint POST /departments
   - Validación de datos con express-validator
   - Tests unitarios
   
   ## Testing
   - [x] Tests pasan localmente
   - [x] Probado manualmente con Postman
   - [x] Sin errores de TypeScript
   
   ## Screenshots (si aplica)
   ![screenshot](url)
   
   Cierra #XXX (número de issue)
   ```
5. Solicitar review
6. Una vez aprobado, hacer **Squash and Merge** a `develop`

### 5. Merge a Main (Release)

Cuando `develop` esté listo para producción:

```bash
# Crear rama de release
git checkout develop
git checkout -b release/v1.0.0

# Actualizar version en package.json
# Hacer últimos ajustes

# Merge a main
git checkout main
git merge release/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags

# Merge también a develop
git checkout develop
git merge release/v1.0.0
git push origin develop

# Eliminar rama de release
git branch -d release/v1.0.0
```

## Estado Actual

### ✅ Completado (en main)
- HU-001: Configuración inicial
- HU-002: MongoDB y schemas
- HU-003: Autenticación JWT
- HU-004: Autorización por roles

### 🚀 Próximas Features (pendientes)
- HU-005: CRUD de departamentos (backend)
- HU-006: Subida de imágenes
- HU-007: Galería pública
- HU-008: Vista detallada
- HU-009: Panel admin
- ... (ver BACKLOG.md)

## Scripts Útiles

### Crear nueva feature rápidamente
```bash
# Crear archivo git-new-feature.sh
./scripts/git-new-feature.sh HU-005 "crud-departamentos"
```

### Sincronizar con develop
```bash
git checkout develop
git pull origin develop
git checkout feature/HU-XXX-descripcion
git merge develop
# Resolver conflictos si hay
git push
```

### Ver ramas activas
```bash
git branch -a
```

### Limpiar ramas locales ya mergeadas
```bash
git branch --merged | grep -v "\*\|main\|develop" | xargs -n 1 git branch -d
```

## Reglas Importantes

1. **NUNCA** hacer push directo a `main`
2. **SIEMPRE** trabajar en ramas de feature
3. **SIEMPRE** hacer Pull Request para merge a `develop`
4. **Commits pequeños y frecuentes** mejor que commits grandes
5. **Tests** antes de hacer PR
6. **Rebase interactivo** para limpiar commits antes de PR (opcional)
7. **Actualizar develop** regularmente en tu feature branch

## Configuración Inicial

```bash
# Crear rama develop si no existe
git checkout -b develop
git push -u origin develop

# Proteger ramas en GitHub (Settings → Branches)
# - main: Require PR, require reviews, require status checks
# - develop: Require PR, require reviews
```

## Ejemplo Completo: HU-005

```bash
# 1. Crear rama
git checkout develop
git pull origin develop
git checkout -b feature/HU-005-crud-departamentos

# 2. Implementar
# - Crear entity Department
# - Crear repository
# - Crear use cases
# - Crear controller
# - Crear routes
# - Agregar tests

# 3. Commits durante el desarrollo
git add src/domain/entities/Department.entity.ts
git commit -m "feat(departments): agregar entidad Department"

git add src/infrastructure/repositories/DepartmentRepository.ts
git commit -m "feat(departments): implementar repositorio"

git add src/application/use-cases/departments/
git commit -m "feat(departments): agregar casos de uso CRUD"

git add src/presentation/controllers/DepartmentController.ts
git commit -m "feat(departments): agregar controller con endpoints"

git add tests/
git commit -m "test(departments): agregar tests unitarios"

# 4. Push
git push -u origin feature/HU-005-crud-departamentos

# 5. Crear PR en GitHub
# 6. Después del merge, actualizar local
git checkout develop
git pull origin develop
git branch -d feature/HU-005-crud-departamentos
```

## Recursos

- [Git Flow Cheatsheet](https://danielkummer.github.io/git-flow-cheatsheet/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
