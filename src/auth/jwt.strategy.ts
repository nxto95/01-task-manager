import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ACCESS_TOKEN_KEY, IJwtPayload, SECRET } from './auth.service';
import { Request } from 'express';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.[ACCESS_TOKEN_KEY] as string;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: SECRET,
    });
  }

  validate(payload: IJwtPayload) {
    return { userId: payload.sub };
  }
}
