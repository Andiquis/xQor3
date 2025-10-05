# 🔐 Módulo de Roles - Sistema xQore

## 📋 Descripción General

El módulo de roles implementa un sistema completo de control de acceso basado en roles (RBAC) para la API de xQore. Permite gestionar roles, asignar permisos y controlar el acceso a diferentes funcionalidades según el nivel de autorización del usuario.

## 🏗️ Arquitectura del Módulo

### Estructura de Archivos

```
src/roles/
├── dto/
│   ├── assign-role.dto.ts      # DTO para asignación/revocación de roles
│   ├── create-rol.dto.ts       # DTO para creación de roles
│   └── update-rol.dto.ts       # DTO para actualización de roles
├── roles.controller.ts         # Controlador REST con endpoints
├── roles.service.ts           # Lógica de negocio y acceso a datos
└── roles.module.ts           # Configuración del módulo
```

### Dependencias

```
src/common/
├── guards/
│   └── roles.guard.ts         # Guard de autorización por roles
└── decorators/
    └── roles.decorator.ts     # Decorador @Roles()
```

## 🔑 Sistema de Roles

### Jerarquía de Roles

1. **superadmin** - Control total del sistema
2. **admin** - Gestión administrativa limitada
3. **usuario** - Acceso básico de lectura

### Matriz de Permisos

| Endpoint                   | Método | Superadmin | Admin | Usuario |
| -------------------------- | ------ | ---------- | ----- | ------- |
| `/roles`                   | POST   | ✅         | ❌    | ❌      |
| `/roles`                   | GET    | ✅         | ✅    | ✅      |
| `/roles/:id`               | GET    | ✅         | ✅    | ✅      |
| `/roles/:id`               | PATCH  | ✅         | ❌    | ❌      |
| `/roles/:id`               | DELETE | ✅         | ❌    | ❌      |
| `/roles/:id/toggle-estado` | PATCH  | ✅         | ❌    | ❌      |
| `/roles/:id/usuarios`      | GET    | ✅         | ✅    | ❌      |
| `/roles/:id/assign`        | POST   | ✅         | ✅    | ❌      |

## 🛠️ API Endpoints

### 1. Crear Rol

```http
POST /roles
Authorization: Bearer {jwt_token}
```

**Permisos:** Solo `superadmin`

**Body:**

```json
{
  "nombreRol": "moderador",
  "descripcionRol": "Moderador del sistema con permisos específicos"
}
```

**Respuesta:**

```json
{
  "idRol": 5,
  "nombreRol": "moderador",
  "estadoRol": "activo",
  "descripcionRol": "Moderador del sistema con permisos específicos"
}
```

### 2. Listar Roles

```http
GET /roles
Authorization: Bearer {jwt_token}
```

**Permisos:** Todos los usuarios autenticados

**Respuesta:**

```json
[
  {
    "idRol": 1,
    "nombreRol": "superadmin",
    "estadoRol": "activo",
    "descripcionRol": "Acceso total al sistema",
    "_count": {
      "usuarioRoles": 2
    }
  }
]
```

### 3. Obtener Rol por ID

```http
GET /roles/:id
Authorization: Bearer {jwt_token}
```

**Permisos:** Todos los usuarios autenticados

### 4. Actualizar Rol

```http
PATCH /roles/:id
Authorization: Bearer {jwt_token}
```

**Permisos:** Solo `superadmin`

**Body:**

```json
{
  "descripcionRol": "Nueva descripción del rol"
}
```

### 5. Eliminar Rol

```http
DELETE /roles/:id
Authorization: Bearer {jwt_token}
```

**Permisos:** Solo `superadmin`

**Nota:** No se puede eliminar un rol que tiene usuarios asignados.

### 6. Cambiar Estado del Rol

```http
PATCH /roles/:id/toggle-estado
Authorization: Bearer {jwt_token}
```

**Permisos:** Solo `superadmin`

**Descripción:** Alterna entre estado `activo` e `inactivo`.

### 7. Obtener Usuarios por Rol

```http
GET /roles/:id/usuarios
Authorization: Bearer {jwt_token}
```

**Permisos:** `admin` y `superadmin`

**Respuesta:**

```json
[
  {
    "idUsuarioRol": "2",
    "idUsuario": "2",
    "idRol": 1,
    "estado": "activo",
    "fechaAsignacion": "2025-10-05T08:51:29.000Z",
    "fechaRevocacion": null,
    "usuario": {
      "idUsuario": "2",
      "nombreUser": "Juan Carlos Pérez González",
      "emailUser": "andiquispe9422@gmail.com",
      "activo": true,
      "fechaCreacion": "2025-10-05T08:51:29.000Z"
    }
  }
]
```

### 8. Asignar/Revocar Rol a Usuario

```http
POST /roles/:id/assign
Authorization: Bearer {jwt_token}
```

**Permisos:** `admin` y `superadmin`

**Body para Asignar:**

```json
{
  "idUsuario": "2",
  "action": "assign"
}
```

**Body para Revocar:**

```json
{
  "idUsuario": "2",
  "action": "revoke"
}
```

**Respuesta (Asignación):**

```json
{
  "message": "Rol asignado exitosamente",
  "assignment": {
    "idUsuarioRol": "3",
    "usuario": {
      "idUsuario": "2",
      "nombreUser": "Juan Carlos Pérez González",
      "emailUser": "andiquispe9422@gmail.com"
    },
    "rol": {
      "idRol": 1,
      "nombreRol": "admin",
      "estadoRol": "activo"
    },
    "fechaAsignacion": "2025-10-05T09:15:00.000Z"
  }
}
```

## 🔒 Sistema de Seguridad

### Guards Implementados

1. **JwtAuthGuard**: Verifica que el usuario esté autenticado
2. **RolesGuard**: Verifica que el usuario tenga los roles necesarios

### Decorador @Roles()

```typescript
// Solo superadmin
@Roles('superadmin')

// Admin o superadmin
@Roles('admin', 'superadmin')

// Cualquier usuario autenticado (sin decorador)
```

### Manejo de Errores

- **401 Unauthorized**: Token JWT inválido o expirado
- **403 Forbidden**: Usuario no tiene los permisos necesarios
- **404 Not Found**: Rol o usuario no encontrado
- **409 Conflict**: Conflictos de datos (rol ya existe, ya asignado, etc.)

## 💾 Base de Datos

### Tabla: t_roles

```sql
CREATE TABLE t_roles (
  id_rol INT PRIMARY KEY AUTO_INCREMENT,
  nombre_rol VARCHAR(50) UNIQUE NOT NULL,
  estado_rol ENUM('activo', 'inactivo') DEFAULT 'activo',
  descripcion_rol TEXT
);
```

### Tabla: t_usuario_roles

```sql
CREATE TABLE t_usuario_roles (
  id_usuario_rol BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_usuario BIGINT NOT NULL,
  id_rol INT NOT NULL,
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_revocacion DATETIME NULL
);
```

## 🧪 Casos de Uso

### Flujo de Asignación de Roles

1. **Superadmin crea un nuevo rol** (ej: "moderador")
2. **Admin asigna el rol a un usuario**
3. **Usuario obtiene permisos según su nuevo rol**
4. **Admin puede revocar el rol cuando sea necesario**

### Ejemplo de Uso Completo

```bash
# 1. Listar roles disponibles
curl -H "Authorization: Bearer {token}" \
  GET http://localhost:3001/roles

# 2. Ver usuarios con rol admin
curl -H "Authorization: Bearer {admin_token}" \
  GET http://localhost:3001/roles/2/usuarios

# 3. Asignar rol moderador al usuario
curl -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"idUsuario": "3", "action": "assign"}' \
  POST http://localhost:3001/roles/4/assign
```

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h
DATABASE_URL=mysql://user:password@localhost:3306/db_name
```

### Roles Predeterminados

El sistema debe tener estos roles básicos:

```sql
INSERT INTO t_roles (nombre_rol, descripcion_rol) VALUES
('superadmin', 'Acceso total al sistema'),
('admin', 'Gestión administrativa del sistema'),
('usuario', 'Acceso básico del sistema');
```

## 📊 Monitoreo y Auditoría

### Logs Automáticos

- ✅ Creación, actualización y eliminación de roles
- ✅ Asignación y revocación de roles a usuarios
- ✅ Intentos de acceso no autorizado
- ✅ Errores de validación y permisos

### Campos de Auditoría

- `fecha_asignacion`: Cuándo se asignó el rol
- `fecha_revocacion`: Cuándo se revocó el rol
- `estado`: Estado actual de la asignación

## 🚀 Mejoras Futuras

- [ ] Sistema de permisos granulares
- [ ] Roles temporales con expiración
- [ ] Herencia de roles
- [ ] Dashboard de gestión de roles
- [ ] Notificaciones de cambios de roles
- [ ] Historial completo de cambios

## 📝 Notas de Desarrollo

### Consideraciones Importantes

1. **BigInt Serialization**: Los IDs se convierten a string para evitar errores de JSON
2. **Soft Delete**: Los roles se marcan como inactivos en lugar de eliminarse
3. **Validaciones**: Se verifican conflictos antes de asignar roles
4. **Transacciones**: Las operaciones críticas usan transacciones de DB

### Testing

```bash
# Ejecutar tests del módulo
npm run test:watch -- roles

# Ejecutar tests de integración
npm run test:e2e -- roles
```

---

**Desarrollado para el Sistema xQore** 🚀  
**Versión:** 1.0.0  
**Fecha:** Octubre 2025
