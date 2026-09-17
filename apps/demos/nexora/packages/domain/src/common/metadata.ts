import type { Instant } from './time';

export interface EntityMetadata {
  id: string;
  organizationId: string;
  createdAt: Instant;
  createdBy: string;
  updatedAt: Instant;
  updatedBy: string;
  version: number;
  archivedAt?: Instant;
}

export function newMetadata(id: string, organizationId: string, actorId: string, at: Instant): EntityMetadata {
  return { id, organizationId, createdAt: at, createdBy: actorId, updatedAt: at, updatedBy: actorId, version: 1 };
}

export function touch(metadata: EntityMetadata, actorId: string, at: Instant): EntityMetadata {
  return { ...metadata, updatedAt: at, updatedBy: actorId, version: metadata.version + 1 };
}
