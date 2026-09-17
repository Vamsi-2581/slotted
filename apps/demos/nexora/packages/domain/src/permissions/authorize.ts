import type { PermissionScope } from '../identity';
import type { Permission } from './catalog';

export interface ScopeResource {
  ownerId?: string;
  teamIds?: readonly string[];
  warehouseId?: string;
}

export interface AuthorizationInput {
  userId: string;
  permissions: readonly Permission[];
  scopes: Partial<Record<Permission, readonly PermissionScope[]>>;
}

export type AuthorizationResult = { allowed: true } | { allowed: false; reason: 'missing' | 'scope' };

function covers(scope: PermissionScope, userId: string, resource: ScopeResource): boolean {
  switch (scope.type) {
    case 'all':
      return true;
    case 'own':
      return resource.ownerId === userId;
    case 'team':
      return (resource.teamIds ?? []).some((id) => scope.teamIds.includes(id));
    case 'warehouse':
      return resource.warehouseId !== undefined && scope.warehouseIds.includes(resource.warehouseId);
  }
}

export function authorize(input: AuthorizationInput, permission: Permission, resource?: ScopeResource): AuthorizationResult {
  if (!input.permissions.includes(permission)) return { allowed: false, reason: 'missing' };
  if (resource === undefined) return { allowed: true };
  const scopes = input.scopes[permission] ?? [{ type: 'all' }];
  return scopes.some((scope) => covers(scope, input.userId, resource))
    ? { allowed: true }
    : { allowed: false, reason: 'scope' };
}
