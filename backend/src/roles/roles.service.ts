import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRolDto: CreateRolDto): Promise<any> {
    // Verificar si el nombre del rol ya existe
    const existingRol = await this.findByName(createRolDto.nombreRol);
    if (existingRol) {
      throw new ConflictException(
        `El rol '${createRolDto.nombreRol}' ya existe`,
      );
    }

    return (this.prisma as any).rol.create({
      data: createRolDto,
    });
  }

  async findAll(): Promise<any[]> {
    return (this.prisma as any).rol.findMany({
      orderBy: {
        nombreRol: 'asc',
      },
      include: {
        _count: {
          select: {
            usuarioRoles: {
              where: {
                estado: 'activo',
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: number): Promise<any> {
    const rol = await (this.prisma as any).rol.findUnique({
      where: { idRol: id },
      include: {
        usuarioRoles: {
          where: {
            estado: 'activo',
          },
          include: {
            usuario: {
              select: {
                idUsuario: true,
                nombreUser: true,
                emailUser: true,
                activo: true,
              },
            },
          },
        },
        _count: {
          select: {
            usuarioRoles: {
              where: {
                estado: 'activo',
              },
            },
          },
        },
      },
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    // Transformar completamente para evitar problemas de BigInt
    if (rol.usuarioRoles) {
      rol.usuarioRoles = rol.usuarioRoles.map((usuarioRol: any) => ({
        idUsuarioRol: usuarioRol.idUsuarioRol
          ? usuarioRol.idUsuarioRol.toString()
          : null,
        idUsuario: usuarioRol.idUsuario
          ? usuarioRol.idUsuario.toString()
          : null,
        idRol: usuarioRol.idRol,
        estado: usuarioRol.estado,
        fechaAsignacion: usuarioRol.fechaAsignacion,
        fechaRevocacion: usuarioRol.fechaRevocacion,
        usuario: {
          idUsuario: usuarioRol.usuario.idUsuario.toString(),
          nombreUser: usuarioRol.usuario.nombreUser,
          emailUser: usuarioRol.usuario.emailUser,
          activo: usuarioRol.usuario.activo,
        },
      }));
    }

    return rol;
  }

  async findByName(nombreRol: string): Promise<any> {
    return (this.prisma as any).rol.findUnique({
      where: { nombreRol },
    });
  }

  async update(id: number, updateRolDto: UpdateRolDto): Promise<any> {
    // Verificar que el rol existe
    await this.findOne(id);

    // Si se está cambiando el nombre, verificar que no exista otro rol con ese nombre
    if (updateRolDto.nombreRol) {
      const existingRol = await this.findByName(updateRolDto.nombreRol);
      if (existingRol && existingRol.idRol !== id) {
        throw new ConflictException(
          `El rol '${updateRolDto.nombreRol}' ya existe`,
        );
      }
    }

    return (this.prisma as any).rol.update({
      where: { idRol: id },
      data: updateRolDto,
    });
  }

  async remove(id: number): Promise<any> {
    const rol = await this.findOne(id);

    // Verificar si hay usuarios activos con este rol
    const usuariosActivos = await (this.prisma as any).usuarioRol.count({
      where: {
        idRol: id,
        estado: 'activo',
      },
    });

    if (usuariosActivos > 0) {
      throw new ConflictException(
        `No se puede eliminar el rol '${rol.nombreRol}' porque tiene ${usuariosActivos} usuario(s) asignado(s)`,
      );
    }

    // Eliminar todas las relaciones de usuario-rol antes de eliminar el rol
    await (this.prisma as any).usuarioRol.deleteMany({
      where: { idRol: id },
    });

    return (this.prisma as any).rol.delete({
      where: { idRol: id },
    });
  }

  async toggleEstado(id: number): Promise<any> {
    const rol = await this.findOne(id);

    const nuevoEstado = rol.estadoRol === 'activo' ? 'inactivo' : 'activo';

    return (this.prisma as any).rol.update({
      where: { idRol: id },
      data: { estadoRol: nuevoEstado },
    });
  }

  async getUsuariosByRol(id: number): Promise<any[]> {
    await this.findOne(id); // Verificar que el rol existe

    const usuarioRoles = await (this.prisma as any).usuarioRol.findMany({
      where: {
        idRol: id,
        estado: 'activo',
      },
      include: {
        usuario: {
          select: {
            idUsuario: true,
            nombreUser: true,
            emailUser: true,
            activo: true,
            fechaCreacion: true,
          },
        },
      },
    });

    // Transformar completamente para evitar problemas de BigInt
    return usuarioRoles.map((usuarioRol: any) => ({
      idUsuarioRol: usuarioRol.idUsuarioRol
        ? usuarioRol.idUsuarioRol.toString()
        : null,
      idUsuario: usuarioRol.idUsuario ? usuarioRol.idUsuario.toString() : null,
      idRol: usuarioRol.idRol,
      estado: usuarioRol.estado,
      fechaAsignacion: usuarioRol.fechaAsignacion,
      fechaRevocacion: usuarioRol.fechaRevocacion,
      usuario: {
        idUsuario: usuarioRol.usuario.idUsuario.toString(),
        nombreUser: usuarioRol.usuario.nombreUser,
        emailUser: usuarioRol.usuario.emailUser,
        activo: usuarioRol.usuario.activo,
        fechaCreacion: usuarioRol.usuario.fechaCreacion,
      },
    }));
  }

  async assignRoleToUser(
    rolId: number,
    userId: string,
    action: 'assign' | 'revoke',
  ): Promise<any> {
    // Verificar que el rol existe
    await this.findOne(rolId);

    // Verificar que el usuario existe
    const userIdBigInt = BigInt(userId);
    const user = await (this.prisma as any).usuario.findUnique({
      where: { idUsuario: userIdBigInt },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    if (action === 'assign') {
      // Verificar si ya tiene el rol asignado
      const existingAssignment = await (
        this.prisma as any
      ).usuarioRol.findFirst({
        where: {
          idUsuario: userIdBigInt,
          idRol: rolId,
          estado: 'activo',
        },
      });

      if (existingAssignment) {
        throw new ConflictException('El usuario ya tiene este rol asignado');
      }

      // Asignar el rol
      const assignment = await (this.prisma as any).usuarioRol.create({
        data: {
          idUsuario: userIdBigInt,
          idRol: rolId,
          estado: 'activo',
        },
        include: {
          rol: true,
          usuario: {
            select: {
              idUsuario: true,
              nombreUser: true,
              emailUser: true,
            },
          },
        },
      });

      return {
        message: 'Rol asignado exitosamente',
        assignment: {
          idUsuarioRol: assignment.idUsuarioRol.toString(),
          usuario: {
            idUsuario: assignment.usuario.idUsuario.toString(),
            nombreUser: assignment.usuario.nombreUser,
            emailUser: assignment.usuario.emailUser,
          },
          rol: assignment.rol,
          fechaAsignacion: assignment.fechaAsignacion,
        },
      };
    } else {
      // Revocar el rol (cambiar estado a inactivo)
      const activeAssignment = await (this.prisma as any).usuarioRol.findFirst({
        where: {
          idUsuario: userIdBigInt,
          idRol: rolId,
          estado: 'activo',
        },
      });

      if (!activeAssignment) {
        throw new NotFoundException(
          'El usuario no tiene este rol asignado activamente',
        );
      }

      await (this.prisma as any).usuarioRol.update({
        where: { idUsuarioRol: activeAssignment.idUsuarioRol },
        data: {
          estado: 'inactivo',
          fechaRevocacion: new Date(),
        },
      });

      return {
        message: 'Rol revocado exitosamente',
        revocation: {
          idUsuarioRol: activeAssignment.idUsuarioRol.toString(),
          fechaRevocacion: new Date(),
        },
      };
    }
  }
}
