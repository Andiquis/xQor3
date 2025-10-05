import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcryptjs';

// Tipos temporales hasta que Prisma genere correctamente
type UsuarioWithRoles = {
  idUsuario: bigint;
  nombreUser: string;
  emailUser: string;
  passwordUser: string;
  activo: boolean;
  bloqueadoHasta?: Date | null;
  intentosLoginFallidos?: number;
  ultimoLogin?: Date | null;
  emailVerificado?: boolean;
  usuarioRoles?: Array<{
    rol: {
      nombreRol: string;
    };
  }>;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);

      if (!user) {
        this.logger.warn(
          `Intento de login fallido: usuario no encontrado ${email}`,
        );
        return null;
      }

      // Verificar si la cuenta está bloqueada
      if (user.bloqueadoHasta && new Date() < user.bloqueadoHasta) {
        const tiempoRestante = Math.ceil(
          (user.bloqueadoHasta.getTime() - Date.now()) / 60000,
        );
        throw new UnauthorizedException(
          `Cuenta bloqueada por intentos fallidos. Intenta nuevamente en ${tiempoRestante} minutos`,
        );
      }

      // Verificar si la cuenta está activa
      if (!user.activo) {
        throw new UnauthorizedException(
          'Cuenta desactivada. Contacta al administrador',
        );
      }

      // Validar contraseña
      const isPasswordValid = await this.usersService.validatePassword(
        user,
        password,
      );

      if (!isPasswordValid) {
        await this.handleFailedLogin(user);
        return null;
      }

      // Login exitoso - resetear intentos fallidos
      await this.handleSuccessfulLogin(user);

      const { passwordUser, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Error en validación de usuario: ${error.message}`);
      throw new UnauthorizedException('Error en la autenticación');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Obtener roles del usuario
    const roles = user.usuarioRoles?.map((ur) => ur.rol.nombreRol) || [
      'usuario',
    ];
    const primaryRole = roles[0] || 'usuario';

    // Crear payload del JWT
    const payload = {
      email: user.emailUser,
      sub: user.idUsuario.toString(),
      roles: roles,
      iat: Math.floor(Date.now() / 1000),
    };

    // Obtener configuración de expiración
    const expiresIn =
      this.configService.get('jwt.signOptions.expiresIn') || '24h';
    const expiresInSeconds = this.parseExpirationTime(expiresIn);

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`Login exitoso para usuario: ${user.emailUser}`);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: expiresInSeconds,
      user: {
        id: user.idUsuario.toString(),
        email: user.emailUser,
        nombre: user.nombreUser,
        roles: roles,
        emailVerificado: user.emailVerificado || false,
        activo: user.activo,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      // Verificar si el email ya existe
      const existingUser = await this.usersService.findByEmail(
        registerDto.email,
      );
      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }

      // Verificar DNI si se proporciona
      if (registerDto.dni) {
        const existingDni = await this.checkDniExists(registerDto.dni);
        if (existingDni) {
          throw new ConflictException('El DNI ya está registrado');
        }
      }

      // Crear usuario
      const user = await this.usersService.create(registerDto);

      this.logger.log(`Nuevo usuario registrado: ${user.emailUser}`);

      // Generar token inmediatamente tras el registro
      const payload = {
        email: user.emailUser,
        sub: user.idUsuario.toString(),
        roles: ['usuario'],
        iat: Math.floor(Date.now() / 1000),
      };

      const expiresIn =
        this.configService.get('jwt.signOptions.expiresIn') || '24h';
      const expiresInSeconds = this.parseExpirationTime(expiresIn);
      const accessToken = this.jwtService.sign(payload);

      return {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: expiresInSeconds,
        user: {
          id: user.idUsuario.toString(),
          email: user.emailUser,
          nombre: user.nombreUser,
          roles: ['usuario'],
          emailVerificado: false,
          activo: true,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Error en registro: ${error.message}`);
      throw new BadRequestException('Error al crear la cuenta');
    }
  }

  private async handleFailedLogin(user: UsuarioWithRoles): Promise<void> {
    const intentos = (user.intentosLoginFallidos || 0) + 1;
    const shouldLock = intentos >= this.MAX_LOGIN_ATTEMPTS;

    await (this.prisma as any).usuario.update({
      where: { idUsuario: user.idUsuario },
      data: {
        intentosLoginFallidos: intentos,
        bloqueadoHasta: shouldLock
          ? new Date(Date.now() + this.LOCKOUT_DURATION)
          : null,
      },
    });

    if (shouldLock) {
      this.logger.warn(
        `Cuenta bloqueada por intentos fallidos: ${user.emailUser}`,
      );
    }
  }

  private async handleSuccessfulLogin(user: UsuarioWithRoles): Promise<void> {
    await (this.prisma as any).usuario.update({
      where: { idUsuario: user.idUsuario },
      data: {
        intentosLoginFallidos: 0,
        bloqueadoHasta: null,
        ultimoLogin: new Date(),
      },
    });
  }

  private async checkDniExists(dni: string): Promise<boolean> {
    const existing = await (this.prisma as any).usuario.findUnique({
      where: { dniUser: dni },
    });
    return !!existing;
  }

  private parseExpirationTime(expiresIn: string): number {
    if (typeof expiresIn === 'number') return expiresIn;

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 86400; // 24 horas por defecto

    const [, value, unit] = match;
    const num = parseInt(value);

    switch (unit) {
      case 's':
        return num;
      case 'm':
        return num * 60;
      case 'h':
        return num * 3600;
      case 'd':
        return num * 86400;
      default:
        return 86400;
    }
  }
}
