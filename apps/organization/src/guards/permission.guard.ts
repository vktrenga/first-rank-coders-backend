import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from './permission.service';


@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {

    console.log('PermissionGuard initialized');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('PermissionGuard canActivate called');
    const requiredPermission = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    );
    console.log('Required permission:', await this.reflector.get('permission', context.getHandler()));
    if (!requiredPermission) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('User in PermissionGuard:', user);
    const has = this.permissionService.userHasPermission(
      user.role,
      requiredPermission,
    );

    if (!has) throw new ForbiddenException('Permission denied');

    return true;
  }
}
