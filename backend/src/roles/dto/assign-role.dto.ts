import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({
    description: 'ID del usuario al que se le asignará el rol',
    example: '2',
  })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  @IsString({ message: 'El ID del usuario debe ser una cadena' })
  readonly idUsuario: string;

  @ApiProperty({
    description: 'Acción a realizar: assign o revoke',
    example: 'assign',
    enum: ['assign', 'revoke'],
  })
  @IsNotEmpty({ message: 'La acción es requerida' })
  @IsString({ message: 'La acción debe ser una cadena' })
  readonly action: 'assign' | 'revoke';
}
