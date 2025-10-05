import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: '🔓 Registrar nuevo usuario (Sin autenticación requerida)',
    description: `Crea una nueva cuenta de usuario en el sistema y devuelve un token JWT automáticamente.
    
    **🔑 Autenticación:** No requerida - Endpoint público
    
    **📝 Requisitos de contraseña:**
    - Mínimo 8 caracteres
    - Al menos 1 letra mayúscula
    - Al menos 1 letra minúscula  
    - Al menos 1 número
    - Al menos 1 símbolo (@$!%*?&)
    
    **✅ Validaciones:**
    - Email único en el sistema
    - DNI único (si se proporciona)
    - Teléfono en formato internacional
    
    **💡 Nota:** Después del registro, puedes usar el access_token devuelto para autenticarte en otros endpoints.`,
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: 86400,
        user: {
          id: '1',
          email: 'usuario@ejemplo.com',
          nombre: 'Juan Carlos Pérez González',
          roles: ['usuario'],
          emailVerificado: false,
          activo: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
    schema: {
      example: {
        message: [
          'Debe ser un email válido',
          'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 símbolo (@$!%*?&)',
        ],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email o DNI ya registrado',
    schema: {
      example: {
        message: 'El email ya está registrado',
        statusCode: 409,
      },
    },
  })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({
    summary: '🔓 Iniciar sesión (Sin autenticación requerida)',
    description: `Autentica un usuario existente y devuelve un token JWT para acceder a endpoints protegidos.
    
    **🔑 Autenticación:** No requerida - Endpoint público
    
    **🔐 Características de seguridad:**
    - Bloqueo automático después de 5 intentos fallidos
    - Cuenta bloqueada por 15 minutos tras intentos fallidos
    - Registro de intentos de acceso
    - Validación de cuenta activa y email verificado
    
    **🎫 Token JWT incluye:**
    - ID del usuario
    - Email
    - Roles asignados (superadmin, admin, usuario)
    - Tiempo de expiración (24 horas)
    
    **💡 Nota:** Usa el access_token devuelto en el header Authorization: Bearer <token> para endpoints protegidos.`,
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: 86400,
        user: {
          id: '1',
          email: 'usuario@ejemplo.com',
          nombre: 'Juan Carlos Pérez González',
          roles: ['usuario', 'cliente'],
          emailVerificado: true,
          activo: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
    schema: {
      example: {
        message: ['Debe ser un email válido', 'La contraseña es obligatoria'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas o cuenta bloqueada/desactivada',
    schema: {
      examples: {
        'Credenciales incorrectas': {
          value: {
            message: 'Credenciales inválidas',
            statusCode: 401,
          },
        },
        'Cuenta bloqueada': {
          value: {
            message:
              'Cuenta bloqueada por intentos fallidos. Intenta nuevamente en 12 minutos',
            statusCode: 401,
          },
        },
        'Cuenta desactivada': {
          value: {
            message: 'Cuenta desactivada. Contacta al administrador',
            statusCode: 401,
          },
        },
      },
    },
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({
    summary: '🔒 Obtener perfil del usuario (JWT requerido)',
    description: `Obtiene la información completa del usuario autenticado.
    
    **🔑 Autenticación:** JWT Token requerido
    **🎭 Roles:** Cualquier usuario autenticado
    
    **📋 Información devuelta:**
    - ID del usuario
    - Nombre completo
    - Email
    - Roles asignados
    - Estado de verificación
    - Estado activo/inactivo
    
    **💡 Uso:** Ideal para obtener información del usuario logueado en el frontend.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    schema: {
      example: {
        user: {
          idUsuario: '1',
          emailUser: 'usuario@ejemplo.com',
          nombreUser: 'Juan Pérez',
          activo: true,
          usuarioRoles: [
            {
              rol: {
                nombreRol: 'usuario',
              },
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return {
      user: req.user,
    };
  }
}
