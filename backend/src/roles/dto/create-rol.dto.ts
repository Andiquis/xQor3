import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EstadoRol {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

export class CreateRolDto {
  @ApiProperty({
    example: 'moderador',
    description: 'Nombre único del rol',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombreRol: string;

  @ApiProperty({
    example: 'Moderador del sistema con permisos específicos',
    description: 'Descripción detallada del rol',
    required: false,
  })
  @IsString()
  @IsOptional()
  descripcionRol?: string;

  @ApiProperty({
    example: EstadoRol.ACTIVO,
    description: 'Estado del rol',
    enum: EstadoRol,
    default: EstadoRol.ACTIVO,
  })
  @IsEnum(EstadoRol)
  @IsOptional()
  estadoRol?: EstadoRol = EstadoRol.ACTIVO;
}
