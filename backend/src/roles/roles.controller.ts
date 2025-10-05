import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('roles')
@Controller('roles')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({
    summary: '🔒 Crear nuevo rol (Solo Superadmin)',
    description: `Crea un nuevo rol en el sistema con descripción y estado.
    
    **🔑 Autenticación:** JWT Token requerido
    **🎭 Roles permitidos:** superadmin
    **⛔ Restricción:** Solo usuarios con rol superadmin pueden crear roles`,
  })
  @ApiBody({ type: CreateRolDto })
  @ApiResponse({
    status: 201,
    description: 'Rol creado exitosamente',
    schema: {
      example: {
        idRol: 5,
        nombreRol: 'moderador',
        estadoRol: 'activo',
        descripcionRol: 'Moderador del sistema con permisos específicos',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El rol ya existe' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Se requiere rol de superadmin' })
  @Post()
  @Roles('superadmin')
  create(@Body() createRolDto: CreateRolDto) {
    return this.rolesService.create(createRolDto);
  }

  @ApiOperation({
    summary: '🔒 Listar todos los roles (Todos los usuarios)',
    description: `Obtiene una lista de todos los roles del sistema con conteo de usuarios asignados.
    
    **🔑 Autenticación:** JWT Token requerido
    **🎭 Roles permitidos:** Todos los usuarios autenticados
    **📊 Información incluida:** Conteo de usuarios por rol`,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles obtenida exitosamente',
    schema: {
      example: [
        {
          idRol: 1,
          nombreRol: 'superadmin',
          estadoRol: 'activo',
          descripcionRol: 'Acceso total al sistema',
          _count: {
            usuarioRoles: 2,
          },
        },
        {
          idRol: 2,
          nombreRol: 'admin',
          estadoRol: 'activo',
          descripcionRol: 'Gestión administrativa del sistema',
          _count: {
            usuarioRoles: 5,
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @ApiOperation({
    summary: 'Obtener rol por ID',
    description: 'Obtiene un rol específico con sus usuarios asignados',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Rol encontrado',
    schema: {
      example: {
        idRol: 1,
        nombreRol: 'admin',
        estadoRol: 'activo',
        descripcionRol: 'Gestión administrativa del sistema',
        usuarioRoles: [
          {
            usuario: {
              idUsuario: 1,
              nombreUser: 'Juan Pérez',
              emailUser: 'juan@ejemplo.com',
              activo: true,
            },
          },
        ],
        _count: {
          usuarioRoles: 1,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @ApiOperation({
    summary: 'Actualizar rol',
    description: 'Actualiza los datos de un rol existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol a actualizar',
    type: 'integer',
    example: 1,
  })
  @ApiBody({ type: UpdateRolDto })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado exitosamente',
    schema: {
      example: {
        idRol: 1,
        nombreRol: 'administrador',
        estadoRol: 'activo',
        descripcionRol: 'Administrador del sistema actualizado',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({ status: 409, description: 'El nombre del rol ya existe' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Se requiere rol de superadmin' })
  @Patch(':id')
  @Roles('superadmin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRolDto: UpdateRolDto,
  ) {
    return this.rolesService.update(id, updateRolDto);
  }

  @ApiOperation({
    summary: 'Eliminar rol',
    description:
      'Elimina un rol del sistema (solo si no tiene usuarios asignados)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol a eliminar',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Rol eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar el rol porque tiene usuarios asignados',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Se requiere rol de superadmin' })
  @Delete(':id')
  @Roles('superadmin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }

  @ApiOperation({
    summary: 'Cambiar estado del rol',
    description: 'Alterna el estado del rol entre activo e inactivo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del rol cambiado exitosamente',
    schema: {
      example: {
        idRol: 1,
        nombreRol: 'admin',
        estadoRol: 'inactivo',
        descripcionRol: 'Gestión administrativa del sistema',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Se requiere rol de superadmin' })
  @Patch(':id/toggle-estado')
  @Roles('superadmin')
  toggleEstado(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.toggleEstado(id);
  }

  @ApiOperation({
    summary: 'Obtener usuarios por rol',
    description: 'Obtiene todos los usuarios asignados a un rol específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios del rol',
    schema: {
      example: [
        {
          usuario: {
            idUsuario: 1,
            nombreUser: 'Juan Pérez',
            emailUser: 'juan@ejemplo.com',
            activo: true,
            fechaCreacion: '2025-10-05T00:00:00.000Z',
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Se requiere rol de admin o superadmin',
  })
  @Get(':id/usuarios')
  @Roles('admin', 'superadmin')
  getUsuariosByRol(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.getUsuariosByRol(id);
  }

  @ApiOperation({
    summary: 'Asignar o revocar rol a usuario',
    description:
      'Permite al admin asignar o revocar roles a usuarios específicos',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol',
    type: 'integer',
    example: 1,
  })
  @ApiBody({
    description: 'Datos para asignar o revocar rol',
    schema: {
      example: {
        idUsuario: '2',
        action: 'assign',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Rol asignado o revocado exitosamente',
    schema: {
      example: {
        message: 'Rol asignado exitosamente',
        assignment: {
          idUsuarioRol: '3',
          usuario: {
            idUsuario: '2',
            nombreUser: 'Juan Carlos Pérez González',
            emailUser: 'andiquispe9422@gmail.com',
          },
          rol: {
            idRol: 1,
            nombreRol: 'admin',
            estadoRol: 'activo',
          },
          fechaAsignacion: '2025-10-05T09:15:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Rol o usuario no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya tiene este rol asignado',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Se requiere rol de admin o superadmin',
  })
  @Post(':id/assign')
  @Roles('admin', 'superadmin')
  assignRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    return this.rolesService.assignRoleToUser(
      id,
      assignRoleDto.idUsuario,
      assignRoleDto.action,
    );
  }
}
