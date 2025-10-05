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

    return (this.prisma as any).usuarioRol.findMany({
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
  }
}
