import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT de acceso',
  })
  access_token: string;

  @ApiProperty({
    example: 'Bearer',
    description: 'Tipo de token',
  })
  token_type: string;

  @ApiProperty({
    example: 86400,
    description: 'Tiempo de expiración en segundos',
  })
  expires_in: number;

  @ApiProperty({
    description: 'Información del usuario autenticado',
    example: {
      id: '1',
      email: 'usuario@ejemplo.com',
      nombre: 'Juan Carlos Pérez González',
      roles: ['usuario'],
      emailVerificado: false,
      activo: true,
    },
  })
  user: {
    id: string;
    email: string;
    nombre: string;
    roles: string[];
    emailVerificado: boolean;
    activo: boolean;
  };
}

export class ErrorResponseDto {
  @ApiProperty({
    example: 'Validation failed',
    description: 'Mensaje de error',
  })
  message: string | string[];

  @ApiProperty({
    example: 400,
    description: 'Código de estado HTTP',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Error HTTP',
    required: false,
  })
  error?: string;

  @ApiProperty({
    example: '2025-10-05T06:30:00.000Z',
    description: 'Timestamp del error',
    required: false,
  })
  timestamp?: string;

  @ApiProperty({
    example: '/auth/login',
    description: 'Ruta donde ocurrió el error',
    required: false,
  })
  path?: string;
}
