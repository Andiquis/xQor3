import { 
  IsEmail, 
  IsNotEmpty, 
  MinLength, 
  MaxLength, 
  IsString,
  Matches,
  IsOptional,
  IsPhoneNumber 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Email del usuario (será normalizado a minúsculas)',
    maxLength: 255,
  })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @MaxLength(255, { message: 'El email no puede exceder 255 caracteres' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    example: 'MySecureP@ss123',
    description: 'Contraseña del usuario (mínimo 8 caracteres, debe contener mayúscula, minúscula, número y símbolo)',
    minLength: 8,
    maxLength: 128,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(128, { message: 'La contraseña no puede exceder 128 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { 
      message: 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 símbolo (@$!%*?&)' 
    }
  )
  password: string;

  @ApiProperty({
    example: 'Juan Carlos',
    description: 'Nombres del usuario',
    maxLength: 100,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { 
    message: 'El nombre solo puede contener letras y espacios' 
  })
  @Transform(({ value }) => value?.trim().replace(/\s+/g, ' '))
  firstName: string;

  @ApiProperty({
    example: 'Pérez González',
    description: 'Apellidos del usuario',
    maxLength: 100,
  })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { 
    message: 'El apellido solo puede contener letras y espacios' 
  })
  @Transform(({ value }) => value?.trim().replace(/\s+/g, ' '))
  lastName: string;

  @ApiPropertyOptional({
    example: '+51987654321',
    description: 'Número de teléfono (formato internacional)',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  @Matches(/^\+?[1-9]\d{1,14}$/, { 
    message: 'El teléfono debe tener un formato válido (ej: +51987654321)' 
  })
  telefono?: string;

  @ApiPropertyOptional({
    example: '12345678',
    description: 'Documento Nacional de Identidad',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'El DNI debe ser una cadena de texto' })
  @MaxLength(20, { message: 'El DNI no puede exceder 20 caracteres' })
  @Matches(/^[a-zA-Z0-9]+$/, { 
    message: 'El DNI solo puede contener letras y números' 
  })
  dni?: string;
}
