import type { CurrencyCode, EntityMetadata, Instant } from '../common';
import type { Permission } from '../permissions/catalog';

export type UserStatus = 'invited' | 'active' | 'suspended' | 'deactivated';
export type TeamType = 'sales' | 'finance' | 'procurement' | 'warehouse' | 'support' | 'executive' | 'administration';

export interface AddressSnapshot {
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface Organization {
  id: string;
  legalName: string;
  displayName: string;
  industry: string;
  primaryCurrency: 'USD';
  supportedCurrencies: CurrencyCode[];
  timezone: 'America/Chicago';
  fiscalYearStartMonth: 1;
  billingAddress: AddressSnapshot;
  operationalRegions: string[];
  status: 'active';
  metadata: EntityMetadata;
}

export interface NotificationPreferences {
  emailApprovals: boolean;
  emailMentions: boolean;
  inAppApprovals: true;
  inAppMentions: true;
  inAppOperationalAlerts: boolean;
}

export interface User {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  title?: string;
  department?: string;
  managerId?: string;
  status: UserStatus;
  locale: 'en-US';
  timezone: string;
  lastActiveAt?: Instant;
  notificationPreferences: NotificationPreferences;
  metadata: EntityMetadata;
}

export interface Team {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  type: TeamType;
  status: 'active' | 'inactive';
  metadata: EntityMetadata;
}

export interface TeamMembership {
  teamId: string;
  userId: string;
  isLead: boolean;
}

export type PermissionScope =
  | { type: 'all' }
  | { type: 'own' }
  | { type: 'team'; teamIds: string[] }
  | { type: 'warehouse'; warehouseIds: string[] };

export interface PermissionGrant {
  permission: Permission;
  defaultScope: PermissionScope['type'];
}

export interface Role {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  isSystem: boolean;
  grants: PermissionGrant[];
  metadata: EntityMetadata;
}

export interface RoleAssignment {
  id: string;
  organizationId: string;
  userId: string;
  roleId: string;
  scope: PermissionScope;
  createdAt: Instant;
  createdBy: string;
}
