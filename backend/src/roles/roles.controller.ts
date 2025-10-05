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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('roles')
@Controller('roles')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({
    summary: 'Crear nuevo rol',
    description: 'Crea un nuevo rol en el sistema',
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
  @Post()
  create(@Body() createRolDto: CreateRolDto) {
    return this.rolesService.create(createRolDto);
  }

  @ApiOperation({
    summary: 'Listar todos los roles',
    description: 'Obtiene una lista de todos los roles con conteo de usuarios',
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
  @Patch(':id')
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
  @Delete(':id')
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
  @Patch(':id/toggle-estado')
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
  @Get(':id/usuarios')
  getUsuariosByRol(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.getUsuariosByRol(id);
  }
}
