import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		// Ensure reflector is injected by NestJS DI
		console.log('local Reflector:', this.reflector);
		if (!this.reflector) {
			throw new Error('Reflector is not injected. Ensure RolesGuard is provided by NestJS DI.');
		}
		const roles = this.reflector.get<Role[]>('roles', context.getHandler());
		if (!roles || roles.length === 0) return true;
		const request = context.switchToHttp().getRequest();
		const user = request.user;
		if (!user || !roles.includes(user.role)) {
			throw new ForbiddenException('Insufficient role');
		}
		return true;
	}
}
