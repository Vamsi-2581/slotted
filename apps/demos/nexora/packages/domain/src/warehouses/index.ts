import type { EntityMetadata } from '../common';

export interface Warehouse {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  timezone: string;
  status: 'active' | 'inactive';
  metadata: EntityMetadata;
}
