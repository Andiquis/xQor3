import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcryptjs';

// Tipos temporales hasta que Prisma genere correctamente
type Usuario = {
  idUsuario: bigint;
  nombreUser: string;
  emailUser: string;
  passwordUser: string;
  activo: boolean;
  fechaCreacion: Date;
  usuarioRoles?: Array<{
    rol: {
      idRol: number;
      nombreRol: string;
    };
  }>;
};

type UsuarioSinPassword = Omit<Usuario, 'passwordUser'>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(registerDto: RegisterDto): Promise<any> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Crear usuario con todos los campos
    const usuario = await (this.prisma as any).usuario.create({
      data: {
        nombreUser: `${registerDto.firstName} ${registerDto.lastName}`,
        emailUser: registerDto.email,
        passwordUser: hashedPassword,
        telefonoUser: registerDto.telefono || null,
        dniUser: registerDto.dni || null,
        emailVerificado: false,
        intentosLoginFallidos: 0,
        activo: true,
      },
    });

    // Asignar rol de 'usuario' por defecto
    await this.assignDefaultRole(usuario.idUsuario);

    return usuario;
  }
  async findByEmail(email: string): Promise<any> {
    const user = await (this.prisma as any).usuario.findUnique({
      where: { emailUser: email },
      include: {
        usuarioRoles: {
          where: { estado: 'activo' },
          include: {
            rol: true,
          },
        },
      },
    });

    if (user) {
      // Convertir BigInt a string para serialización JSON
      user.idUsuario = user.idUsuario.toString();
    }

    return user;
  }

  async findById(id: bigint): Promise<any> {
    const user = await (this.prisma as any).usuario.findUnique({
      where: { idUsuario: id },
      include: {
        usuarioRoles: {
          where: { estado: 'activo' },
          include: {
            rol: true,
          },
        },
      },
    });

    if (user) {
      // Convertir BigInt a string para serialización JSON
      user.idUsuario = user.idUsuario.toString();
    }

    return user;
  }

  private async assignDefaultRole(usuarioId: bigint): Promise<void> {
    // Buscar el rol 'usuario'
    const rolUsuario = await (this.prisma as any).rol.findUnique({
      where: { nombreRol: 'usuario' },
    });

    if (rolUsuario) {
      await (this.prisma as any).usuarioRol.create({
        data: {
          idUsuario: usuarioId,
          idRol: rolUsuario.idRol,
          estado: 'activo',
        },
      });
    }
  }

  async findAll(): Promise<any[]> {
    const users = await (this.prisma as any).usuario.findMany({
      select: {
        idUsuario: true,
        emailUser: true,
        nombreUser: true,
        activo: true,
        fechaCreacion: true,
        usuarioRoles: {
          where: { estado: 'activo' },
          include: {
            rol: true,
          },
        },
      },
    });

    // Convertir BigInt a string para serialización JSON
    return users.map((user: any) => ({
      ...user,
      idUsuario: user.idUsuario.toString(),
    }));
  }

  async validatePassword(user: any, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordUser);
  }
}
