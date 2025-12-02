import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { UserPermission } from '../../users/entities/permission.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOneWithPermissions(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    // Extract permission strings from UserPermissionEntity array
    const permissions: UserPermission[] = user.permissions
      ? user.permissions.map((up) => up.permission)
      : [];

    return {
      userId: payload.sub,
      email: payload.email,
      permissions,
    };
  }
}
