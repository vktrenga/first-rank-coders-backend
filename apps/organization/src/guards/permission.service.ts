import { Injectable } from '@nestjs/common';
import rolesData from './roles-permissions.json';

@Injectable()
export class PermissionService {
  private roles = rolesData.roles;

  getPermissionsByRole(role: string): string[] {
    return this.roles[role]?.permissions ?? [];
  }

  userHasPermission(role: string, permission: string) {
    const perms = this.getPermissionsByRole(role);
    return perms.includes(permission);
  }
}
