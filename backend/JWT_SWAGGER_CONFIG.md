# 🔐 Configuración JWT en Swagger - xQore API

## 📋 Estado Actual de la Configuración

### ✅ Configuración Estandarizada

**Archivo principal:** `src/main.ts`

- ✅ JWT Security Scheme configurado como `'JWT-auth'`
- ✅ Descripción mejorada con instrucciones paso a paso
- ✅ Información de roles y permisos
- ✅ Opciones de UI optimizadas

**Controladores:**

- ✅ `auth.controller.ts` - Endpoints públicos claramente marcados
- ✅ `roles.controller.ts` - `@ApiBearerAuth('JWT-auth')` a nivel de controlador
- ✅ Endpoints individuales documentados con permisos específicos

## 🔧 Configuración Técnica

### Swagger Security Scheme

```typescript
.addBearerAuth(
  {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    name: 'JWT Token',
    description: 'Token JWT obtenido del login/registro. Formato: Bearer <token>',
    in: 'header',
  },
  'JWT-auth', // Este es el identificador usado en @ApiBearerAuth()
)
```

### Uso en Controladores

```typescript
// A nivel de controlador (todos los endpoints requieren auth)
@ApiBearerAuth('JWT-auth')
@Controller('roles')

// A nivel de endpoint específico
@ApiBearerAuth('JWT-auth')
@Get('profile')
```

## 📚 Convenciones de Documentación

### Títulos de Endpoints

- 🔓 **Sin autenticación:** `'🔓 Endpoint Name (Sin autenticación requerida)'`
- 🔒 **Con autenticación:** `'🔒 Endpoint Name (JWT requerido)'`
- 🔒👑 **Roles específicos:** `'🔒 Endpoint Name (Solo Superadmin)'`

### Descripción Estándar

Cada endpoint incluye:

```typescript
description: `Descripción del endpoint.

**🔑 Autenticación:** JWT Token requerido / No requerida
**🎭 Roles permitidos:** superadmin, admin, usuario / Todos
**📝 Información adicional:** Detalles específicos del endpoint
`;
```

## 🎯 Endpoints por Categoría

### 🔓 Endpoints Públicos (Sin JWT)

- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión

### 🔒 Endpoints Protegidos - Todos los Usuarios

- `GET /auth/profile` - Perfil del usuario
- `GET /roles` - Listar roles
- `GET /roles/:id` - Ver rol específico

### 🔒👑 Endpoints Protegidos - Solo Admin/Superadmin

- `GET /roles/:id/usuarios` - Ver usuarios por rol
- `POST /roles/:id/assign` - Asignar/revocar roles

### 🔒🦸 Endpoints Protegidos - Solo Superadmin

- `POST /roles` - Crear rol
- `PATCH /roles/:id` - Actualizar rol
- `DELETE /roles/:id` - Eliminar rol
- `PATCH /roles/:id/toggle-estado` - Cambiar estado del rol

## 🚀 Instrucciones de Uso en Swagger

### Para desarrolladores:

1. Abre `http://localhost:3001/api/docs`
2. Usa `POST /auth/register` o `POST /auth/login`
3. Copia el `access_token` de la respuesta
4. Haz clic en **"Authorize"** 🔒 (botón verde arriba a la derecha)
5. Introduce: `Bearer <tu-access-token>`
6. Haz clic en **"Authorize"**
7. Ahora puedes usar todos los endpoints protegidos

### Características de la UI:

- ✅ **persistAuthorization: true** - El token se guarda al refrescar
- ✅ **tryItOutEnabled: true** - Botón "Try it out" habilitado
- ✅ **Filtros** - Buscar endpoints fácilmente
- ✅ **Ordenamiento alfabético** - Endpoints organizados
- ✅ **Títulos descriptivos** - Con emojis y roles claros

## 🔧 Próximos Pasos

### Mejoras Implementadas ✅

- [x] Configuración JWT centralizada y consistente
- [x] Documentación clara de permisos en cada endpoint
- [x] Títulos descriptivos con emojis y roles
- [x] Instrucciones paso a paso en Swagger
- [x] UI optimizada para mejor UX

### Posibles Mejoras Futuras 💡

- [ ] Refresh token implementation
- [ ] Roles dinámicos en documentación
- [ ] Ejemplos de respuesta por rol
- [ ] Rate limiting documentation
- [ ] API versioning support

---

**Configuración completada:** ✅ Octubre 2025  
**Última actualización:** Sistema JWT completamente estandarizado
