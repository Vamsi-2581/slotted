import type { EntityMetadata } from './common';

export type WorkflowTriggerType =
  | 'order.created'
  | 'order.confirmed'
  | 'order.value_changed'
  | 'invoice.overdue'
  | 'inventory.below_reorder_point'
  | 'ticket.escalated'
  | 'customer.status_changed'
  | 'schedule.daily'
  | 'schedule.weekly';

export type ConditionOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in'
  | 'is_empty'
  | 'is_not_empty';

export type ConditionNode =
  | { type: 'group'; operator: 'and' | 'or'; children: ConditionNode[] }
  | { type: 'condition'; field: string; operator: ConditionOperator; value: unknown };

export type WorkflowActionType =
  | 'assign_user'
  | 'create_task'
  | 'send_notification'
  | 'request_approval'
  | 'add_tag'
  | 'remove_tag'
  | 'place_customer_on_hold'
  | 'place_order_on_hold'
  | 'create_purchase_order_draft';

export interface WorkflowAction {
  type: WorkflowActionType;
  config: Record<string, unknown>;
}

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'error' | 'archived';

export interface Workflow {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  trigger: { type: WorkflowTriggerType; config?: Record<string, unknown> };
  conditions: ConditionNode;
  actions: WorkflowAction[];
  ownerId: string;
  lastRunAt?: string;
  runCount: number;
  metadata: EntityMetadata;
}

export type WorkflowRunStatus =
  'queued' | 'running' | 'succeeded' | 'partially_failed' | 'failed' | 'skipped';

export interface WorkflowRun {
  id: string;
  organizationId: string;
  workflowId: string;
  triggerEventId: string;
  status: WorkflowRunStatus;
  startedAt: string;
  completedAt?: string;
  affectedEntityType?: string;
  affectedEntityId?: string;
  actionResults: Array<{
    actionIndex: number;
    status: 'succeeded' | 'failed' | 'skipped';
    errorCode?: string;
    message?: string;
  }>;
  errorCode?: string;
}

export const WORKFLOW_LIMITS = {
  maxConditionDepth: 5,
  maxConditions: 50,
  maxChainDepth: 5,
} as const;
