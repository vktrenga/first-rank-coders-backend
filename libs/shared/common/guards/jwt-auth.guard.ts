import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {

    canActivate(context: ExecutionContext): boolean {
        const newLocal = 'JwtAuthGuard: canActivate called';
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid Authorization header');
        }
        const token = authHeader.split(' ')[1];
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
            request.user = payload;
            return true;
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
