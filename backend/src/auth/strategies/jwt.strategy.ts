import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret') || 'fallback-secret',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.activo) {
      return null;
    }

    // Extraer roles para el guard
    const roles = user.usuarioRoles?.map((ur: any) => ur.rol.nombreRol) || [
      'usuario',
    ];

    // Devolver usuario con roles procesados
    return {
      ...user,
      roles: roles, // Array de strings para el RolesGuard
    };
  }
}
