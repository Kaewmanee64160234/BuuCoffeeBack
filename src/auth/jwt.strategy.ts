import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // This will make sure the token is checked for expiration
      secretOrKey: 'yourSecretKey',
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    // Custom token expiration check (optional, if you need more control)
    const currentTime = Math.floor(Date.now() / 1000); // current time in seconds
    if (payload.exp < currentTime) {
      throw new UnauthorizedException('Token has expired');
    }

    // Return validated user data (you can add any other checks here if needed)
    return { userId: payload.sub, username: payload.username };
  }
}
