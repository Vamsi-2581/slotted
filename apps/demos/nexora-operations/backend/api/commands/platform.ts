import {
  AUTOMATION_ACTOR_ID,
  WORKFLOW_LIMITS,
  type ConditionNode,
  type ImportJob,
  type Notification,
  type SavedView,
  type Task,
  type Workflow,
  type WorkflowAction,
  type WorkflowRun,
} from '../../domain';
import type { ApiRuntime, MutationOptions, Transaction } from '../runtime';
import { getWorkflow, workflowListItem, type WorkflowListItem } from '../resources/platform';
import {
  domainError,
  finalize,
  load,
  metadata,
  open,
  transition,
  trimmed,
  Validator,
} from './helpers';

export interface WorkflowInput {
  name: string;
  description?: string;
  trigger: Workflow['trigger'];
  conditions: ConditionNode;
  actions: WorkflowAction[];
}

/** Section 69.2 — condition tree limits. */
export function validateConditions(
  node: ConditionNode,
  depth = 1,
  counter = { count: 0 },
): string[] {
  const errors: string[] = [];
  if (depth > WORKFLOW_LIMITS.maxConditionDepth)
    errors.push(`condition nesting exceeds ${WORKFLOW_LIMITS.maxConditionDepth}`);
  if (node.type === 'group') {
    if (node.children.length === 0) errors.push('condition groups cannot be empty');
    for (const child of node.children)
      errors.push(...validateConditions(child, depth + 1, counter));
  } else {
    counter.count += 1;
    if (!node.field) errors.push('condition field is required');
  }
  if (depth === 1 && counter.count > WORKFLOW_LIMITS.maxConditions)
    errors.push(`workflows allow at most ${WORKFLOW_LIMITS.maxConditions} conditions`);
  return errors;
}

/** Evaluates a condition tree against a flat record (dot paths supported). */
export function evaluateConditions(node: ConditionNode, subject: Record<string, unknown>): boolean {
  if (node.type === 'group') {
    return node.operator === 'and'
      ? node.children.every((child) => evaluateConditions(child, subject))
      : node.children.some((child) => evaluateConditions(child, subject));
  }
  const value = node.field
    .split('.')
    .reduce<unknown>(
      (current, key) =>
        current && typeof current === 'object'
          ? (current as Record<string, unknown>)[key]
          : undefined,
      subject,
    );
  const expected = node.value;
  const asNumber = (input: unknown): number =>
    typeof input === 'object' && input !== null && 'minor' in input
      ? Number((input as { minor: number }).minor)
      : Number(input);
  switch (node.operator) {
    case 'eq':
      return value === expected || asNumber(value) === asNumber(expected);
    case 'neq':
      return !(value === expected || asNumber(value) === asNumber(expected));
    case 'gt':
      return asNumber(value) > asNumber(expected);
    case 'gte':
      return asNumber(value) >= asNumber(expected);
    case 'lt':
      return asNumber(value) < asNumber(expected);
    case 'lte':
      return asNumber(value) <= asNumber(expected);
    case 'contains':
      return Array.isArray(value)
        ? value.includes(expected)
        : String(value ?? '').includes(String(expected));
    case 'not_contains':
      return Array.isArray(value)
        ? !value.includes(expected)
        : !String(value ?? '').includes(String(expected));
    case 'in':
      return Array.isArray(expected) && expected.includes(value);
    case 'not_in':
      return Array.isArray(expected) && !expected.includes(value);
    case 'is_empty':
      return (
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      );
    case 'is_not_empty':
      return !(
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      );
  }
}

export function createPlatformCommands(runtime: ApiRuntime) {
  const workflows = {
    create: (input: WorkflowInput, options?: MutationOptions): Promise<WorkflowListItem> =>
      runtime.command('POST /workflows', options, input, (tx) => {
        const actor = runtime.require('workflows.create');
        const validator = new Validator().required('name', input.name);
        for (const error of validateConditions(input.conditions))
          validator.errors.push({
            field: 'conditions',
            code: 'INVALID_CONDITIONS',
            message: error,
          });
        if (!input.actions || input.actions.length === 0)
          validator.errors.push({
            field: 'actions',
            code: 'REQUIRED',
            message: 'At least one action is required',
          });
        validator.throwIfAny();
        const id = runtime.store.nextId('workflow');
        const workflow: Workflow = {
          id,
          organizationId: runtime.store.dataset.organization.id,
          name: input.name.trim(),
          status: 'draft',
          trigger: input.trigger,
          conditions: input.conditions,
          actions: input.actions,
          ownerId: actor.id,
          runCount: 0,
          metadata: metadata(tx, id),
          ...(trimmed(input.description)
            ? { description: trimmed(input.description) as string }
            : {}),
        };
        tx.create('workflows', workflow);
        tx.audit('workflow.created', 'workflow', id, { nextVersion: 1 });
        return workflowListItem(runtime, workflow);
      }),

    update: (
      id: string,
      input: Partial<WorkflowInput>,
      options?: MutationOptions,
    ): Promise<WorkflowListItem> =>
      runtime.command('PATCH /workflows/:id', options, { id, input }, (tx) => {
        runtime.require('workflows.edit');
        const workflow = open(tx, 'workflows', id, 'Workflow', options);
        if (workflow.status === 'archived')
          throw transition('Workflow', workflow.status, 'be edited');
        const changed: string[] = [];
        if (input.conditions) {
          const errors = validateConditions(input.conditions);
          if (errors.length > 0) throw domainError('VALIDATION_FAILED', errors.join('; '));
          workflow.conditions = input.conditions;
          changed.push('conditions');
        }
        if (trimmed(input.name)) {
          workflow.name = trimmed(input.name) as string;
          changed.push('name');
        }
        if (input.description !== undefined) {
          workflow.description = trimmed(input.description) ?? '';
          changed.push('description');
        }
        if (input.trigger) {
          workflow.trigger = input.trigger;
          changed.push('trigger');
        }
        if (input.actions) {
          if (input.actions.length === 0)
            throw domainError('VALIDATION_FAILED', 'At least one action is required');
          workflow.actions = input.actions;
          changed.push('actions');
        }
        if (workflow.status === 'error') workflow.status = 'paused';
        finalize(tx, 'workflows', workflow, 'workflow.updated', 'workflow', changed);
        return workflowListItem(runtime, workflow);
      }),

    activate: (id: string, options?: MutationOptions): Promise<WorkflowListItem> =>
      runtime.command('POST /workflows/:id/activate', options, { id }, (tx) => {
        runtime.require('workflows.activate');
        const workflow = open(tx, 'workflows', id, 'Workflow', options);
        if (workflow.status === 'archived')
          throw transition('Workflow', workflow.status, 'be activated');
        workflow.status = 'active';
        finalize(tx, 'workflows', workflow, 'workflow.activated', 'workflow', ['status']);
        return workflowListItem(runtime, workflow);
      }),

    pause: (id: string, options?: MutationOptions): Promise<WorkflowListItem> =>
      runtime.command('POST /workflows/:id/pause', options, { id }, (tx) => {
        runtime.require('workflows.activate');
        const workflow = open(tx, 'workflows', id, 'Workflow', options);
        if (workflow.status !== 'active' && workflow.status !== 'error')
          throw transition('Workflow', workflow.status, 'be paused');
        workflow.status = 'paused';
        finalize(tx, 'workflows', workflow, 'workflow.paused', 'workflow', ['status']);
        return workflowListItem(runtime, workflow);
      }),

    archive: (id: string, options?: MutationOptions): Promise<WorkflowListItem> =>
      runtime.command('POST /workflows/:id/archive', options, { id }, (tx) => {
        runtime.require('workflows.archive');
        const workflow = open(tx, 'workflows', id, 'Workflow', options);
        if (workflow.status === 'archived')
          throw transition('Workflow', workflow.status, 'be archived again');
        workflow.status = 'archived';
        workflow.metadata.archivedAt = tx.occurredAt;
        finalize(tx, 'workflows', workflow, 'workflow.archived', 'workflow', ['status']);
        return workflowListItem(runtime, workflow);
      }),

    /** Section 69.4 — runs a workflow against a subject once per event (idempotency key workflowId:eventId). */
    execute: (
      tx: Transaction,
      workflow: Workflow,
      eventId: string,
      subject: Record<string, unknown>,
      affected?: { type: string; id: string },
    ): WorkflowRun | undefined => {
      if (workflow.status !== 'active') return undefined;
      const key = `${workflow.id}:${eventId}`;
      if (
        runtime.indexes.runsByWorkflow
          .get(workflow.id)
          .some((run) => run.triggerEventId === eventId)
      )
        return undefined;
      void key;
      const matched = evaluateConditions(workflow.conditions, subject);
      const run: WorkflowRun = {
        id: runtime.store.nextId('workflowRun'),
        organizationId: workflow.organizationId,
        workflowId: workflow.id,
        triggerEventId: eventId,
        status: matched ? 'running' : 'skipped',
        startedAt: tx.occurredAt,
        completedAt: tx.occurredAt,
        actionResults: [],
        ...(affected ? { affectedEntityType: affected.type, affectedEntityId: affected.id } : {}),
      };
      if (matched) {
        let failed = 0;
        for (const [index, action] of workflow.actions.entries()) {
          try {
            runAction(tx, action, subject, affected);
            run.actionResults.push({ actionIndex: index, status: 'succeeded' });
          } catch (error) {
            failed += 1;
            run.actionResults.push({
              actionIndex: index,
              status: 'failed',
              errorCode: 'ACTION_FAILED',
              message: error instanceof Error ? error.message : String(error),
            });
          }
        }
        run.status =
          failed === 0
            ? 'succeeded'
            : failed === workflow.actions.length
              ? 'failed'
              : 'partially_failed';
        if (run.status === 'failed') run.errorCode = 'ACTION_FAILED';
      }
      tx.create('workflowRuns', run);
      tx.touch('workflows', workflow);
      workflow.runCount += 1;
      workflow.lastRunAt = tx.occurredAt;
      if (run.status === 'failed') workflow.status = 'error';
      tx.dirty('workflows', workflow);
      return run;
    },
  };

  const runAction = (
    tx: Transaction,
    action: WorkflowAction,
    subject: Record<string, unknown>,
    affected?: { type: string; id: string },
  ): void => {
    const config = action.config;
    const resolveUser = (value: unknown): string | undefined => {
      if (typeof value !== 'string') return undefined;
      if (value === 'account_owner' || value === 'quote_owner') {
        const customer =
          (subject['customer'] as { accountOwnerId?: string } | undefined) ?? undefined;
        return (
          (subject['order'] as { ownerId?: string } | undefined)?.ownerId ??
          customer?.accountOwnerId
        );
      }
      return runtime.store.dataset.users.has(value) ? value : undefined;
    };
    switch (action.type) {
      case 'send_notification': {
        const userId = resolveUser(config['userId'] ?? config['target']);
        if (!userId) throw new Error('Notification target unresolved');
        tx.notify(
          userId,
          'info',
          String(config['title'] ?? 'Workflow notification'),
          String(config['body'] ?? ''),
          affected,
        );
        return;
      }
      case 'create_task': {
        const assigneeId = resolveUser(config['assignee']) ?? tx.actor.id;
        const task: Task = {
          id: runtime.store.nextId('task'),
          organizationId: runtime.store.dataset.organization.id,
          title: String(config['title'] ?? 'Workflow task'),
          assigneeId,
          createdBy: AUTOMATION_ACTOR_ID,
          priority: (config['priority'] as Task['priority']) ?? 'normal',
          status: 'open',
          createdAt: tx.occurredAt,
          ...(affected ? { relatedEntityType: affected.type, relatedEntityId: affected.id } : {}),
        };
        tx.create('tasks', task);
        return;
      }
      case 'add_tag':
      case 'remove_tag': {
        if (!affected) return;
        const collection =
          affected.type === 'customer'
            ? 'customers'
            : affected.type === 'sales_order'
              ? undefined
              : affected.type === 'support_ticket'
                ? 'tickets'
                : undefined;
        if (!collection) return;
        const entity = runtime.store.get(collection, affected.id) as { tags: string[] } | undefined;
        if (!entity) return;
        const tag = String(config['tag'] ?? '');
        entity.tags =
          action.type === 'add_tag'
            ? [...new Set([...entity.tags, tag])]
            : entity.tags.filter((existing) => existing !== tag);
        tx.dirty(collection);
        return;
      }
      case 'place_customer_on_hold': {
        const customerId = (subject['customer'] as { id?: string } | undefined)?.id;
        const customer = customerId ? runtime.store.dataset.customers.get(customerId) : undefined;
        if (!customer || customer.status === 'on_hold') return;
        tx.touch('customers', customer);
        customer.status = 'on_hold';
        customer.holdReason = String(config['reason'] ?? 'Placed on hold by workflow');
        finalize(tx, 'customers', customer, 'customer.hold_placed', 'customer', ['status']);
        return;
      }
      case 'place_order_on_hold': {
        const orderId = affected?.type === 'sales_order' ? affected.id : undefined;
        const order = orderId ? runtime.store.dataset.salesOrders.get(orderId) : undefined;
        if (!order || (order.status !== 'confirmed' && order.status !== 'pending_approval')) return;
        tx.touch('salesOrders', order);
        order.status = 'on_hold';
        order.holdReason = String(config['reason'] ?? 'Placed on hold by workflow');
        finalize(tx, 'salesOrders', order, 'order.held', 'sales_order', ['status']);
        return;
      }
      case 'assign_user':
      case 'request_approval':
      case 'create_purchase_order_draft':
        // Delegated to the interactive commands; recorded as succeeded for the simulation.
        return;
    }
  };

  const notifications = {
    markRead: (id: string): Promise<Notification> =>
      runtime.command('POST /notifications/:id/read', undefined, { id }, (tx) => {
        const notification = load(runtime, 'notifications', id, 'Notification');
        if (notification.userId !== tx.actor.id)
          throw domainError(
            'FORBIDDEN',
            'Notifications can only be updated by their recipient',
            403,
          );
        tx.touch('notifications', notification);
        if (!notification.readAt) notification.readAt = tx.occurredAt;
        tx.dirty('notifications', notification);
        return notification;
      }),
    markAllRead: (): Promise<number> =>
      runtime.command('POST /notifications/read-all', undefined, {}, (tx) => {
        let count = 0;
        for (const notification of runtime.indexes.notificationsByUser.get(tx.actor.id)) {
          if (notification.readAt || notification.archivedAt) continue;
          tx.touch('notifications', notification).readAt = tx.occurredAt;
          tx.dirty('notifications', notification);
          count += 1;
        }
        return count;
      }),
    archive: (id: string): Promise<Notification> =>
      runtime.command('POST /notifications/:id/archive', undefined, { id }, (tx) => {
        const notification = load(runtime, 'notifications', id, 'Notification');
        if (notification.userId !== tx.actor.id)
          throw domainError(
            'FORBIDDEN',
            'Notifications can only be updated by their recipient',
            403,
          );
        tx.touch('notifications', notification);
        notification.archivedAt = tx.occurredAt;
        if (!notification.readAt) notification.readAt = tx.occurredAt;
        tx.dirty('notifications', notification);
        return notification;
      }),
  };

  const tasks = {
    create: (input: {
      title: string;
      description?: string;
      assigneeId?: string;
      dueDate?: string;
      priority?: Task['priority'];
      relatedEntityType?: string;
      relatedEntityId?: string;
    }): Promise<Task> =>
      runtime.command('POST /tasks', undefined, input, (tx) => {
        new Validator().required('title', input.title).throwIfAny();
        const task: Task = {
          id: runtime.store.nextId('task'),
          organizationId: runtime.store.dataset.organization.id,
          title: input.title.trim(),
          assigneeId: input.assigneeId ?? tx.actor.id,
          createdBy: tx.actor.id,
          priority: input.priority ?? 'normal',
          status: 'open',
          createdAt: tx.occurredAt,
          ...(trimmed(input.description)
            ? { description: trimmed(input.description) as string }
            : {}),
          ...(input.dueDate ? { dueDate: input.dueDate } : {}),
          ...(input.relatedEntityType && input.relatedEntityId
            ? { relatedEntityType: input.relatedEntityType, relatedEntityId: input.relatedEntityId }
            : {}),
        };
        tx.create('tasks', task);
        if (task.assigneeId !== tx.actor.id)
          tx.notify(
            task.assigneeId,
            'action_required',
            `New task: ${task.title}`,
            task.description ?? '',
            { type: 'task', id: task.id },
          );
        return task;
      }),
    complete: (id: string): Promise<Task> =>
      runtime.command('POST /tasks/:id/complete', undefined, { id }, (tx) => {
        const task = load(runtime, 'tasks', id, 'Task');
        if (task.status !== 'open') throw transition('Task', task.status, 'be completed');
        tx.touch('tasks', task);
        task.status = 'completed';
        task.completedAt = tx.occurredAt;
        tx.dirty('tasks', task);
        return task;
      }),
    cancel: (id: string): Promise<Task> =>
      runtime.command('POST /tasks/:id/cancel', undefined, { id }, (tx) => {
        const task = load(runtime, 'tasks', id, 'Task');
        if (task.status !== 'open') throw transition('Task', task.status, 'be cancelled');
        tx.touch('tasks', task);
        task.status = 'cancelled';
        tx.dirty('tasks', task);
        return task;
      }),
  };

  const savedViews = {
    create: (input: {
      resource: SavedView['resource'];
      name: string;
      isDefault?: boolean;
      state: SavedView['state'];
    }): Promise<SavedView> =>
      runtime.command('POST /saved-views', undefined, input, (tx) => {
        runtime.require('saved_views.manage_own');
        new Validator().required('name', input.name).throwIfAny();
        const id = runtime.store.nextId('savedView');
        if (input.isDefault) {
          for (const other of runtime.indexes.savedViewsByUser.get(tx.actor.id))
            if (other.resource === input.resource && other.isDefault)
              tx.touch('savedViews', other).isDefault = false;
        }
        const view: SavedView = {
          id,
          organizationId: runtime.store.dataset.organization.id,
          userId: tx.actor.id,
          resource: input.resource,
          name: input.name.trim(),
          isDefault: Boolean(input.isDefault),
          state: input.state,
          metadata: metadata(tx, id),
        };
        tx.create('savedViews', view);
        return view;
      }),
    update: (
      id: string,
      input: { name?: string; isDefault?: boolean; state?: SavedView['state'] },
      options?: MutationOptions,
    ): Promise<SavedView> =>
      runtime.command('PATCH /saved-views/:id', options, { id, input }, (tx) => {
        const view = load(runtime, 'savedViews', id, 'Saved view');
        if (view.userId !== tx.actor.id)
          throw domainError('FORBIDDEN', 'Saved views can only be edited by their owner', 403);
        open(tx, 'savedViews', id, 'Saved view', options);
        const changed: string[] = [];
        if (trimmed(input.name)) {
          view.name = trimmed(input.name) as string;
          changed.push('name');
        }
        if (input.state) {
          view.state = input.state;
          changed.push('state');
        }
        if (input.isDefault !== undefined) {
          if (input.isDefault)
            for (const other of runtime.indexes.savedViewsByUser.get(tx.actor.id))
              if (other.id !== id && other.resource === view.resource && other.isDefault)
                tx.touch('savedViews', other).isDefault = false;
          view.isDefault = input.isDefault;
          changed.push('isDefault');
        }
        finalize(tx, 'savedViews', view, 'saved_view.updated', 'saved_view', changed);
        return view;
      }),
    delete: (id: string): Promise<void> =>
      runtime.command('DELETE /saved-views/:id', undefined, { id }, (tx) => {
        const view = load(runtime, 'savedViews', id, 'Saved view');
        if (view.userId !== tx.actor.id)
          throw domainError('FORBIDDEN', 'Saved views can only be deleted by their owner', 403);
        tx.remove('savedViews', id);
      }),
  };

  const imports = {
    /** Section 71.3 — customer CSV import: transactional per row. */
    customers: (input: {
      fileName: string;
      columns: string[];
      rows: string[][];
      mapping: Record<string, string>;
    }): Promise<ImportJob> =>
      runtime.command(
        'POST /imports/customers',
        undefined,
        { fileName: input.fileName, rows: input.rows.length },
        (tx) => {
          runtime.require('imports.run');
          const id = runtime.store.nextId('importJob');
          const job: ImportJob = {
            id,
            organizationId: runtime.store.dataset.organization.id,
            type: 'customers',
            fileName: input.fileName,
            status: 'validating',
            createdBy: tx.actor.id,
            columns: input.columns,
            mapping: input.mapping,
            sampleRows: input.rows.slice(0, 5),
            issues: [],
            metadata: metadata(tx, id),
          };
          tx.create('importJobs', job);
          const columnIndex = (target: string): number => {
            const source = Object.entries(input.mapping).find(
              ([, mapped]) => mapped === target,
            )?.[0];
            return source ? input.columns.indexOf(source) : -1;
          };
          const nameIndex = columnIndex('Company Name');
          const emailIndex = columnIndex('Primary Email');
          const segmentIndex = columnIndex('Segment');
          const termsIndex = columnIndex('Payment Terms');
          if (nameIndex < 0) {
            job.status = 'failed';
            job.issues.push({
              row: 0,
              field: 'Company Name',
              severity: 'error',
              code: 'REQUIRED',
              message: 'Company Name must be mapped',
            });
            tx.dirty('importJobs', job);
            return job;
          }
          let imported = 0;
          let warnings = 0;
          let errors = 0;
          const existingNames = new Set(
            [...runtime.store.dataset.customers.values()].map((customer) =>
              customer.displayName.toLowerCase(),
            ),
          );
          for (const [position, row] of input.rows.entries()) {
            const rowNumber = position + 1;
            const name = (row[nameIndex] ?? '').trim();
            if (!name) {
              job.issues.push({
                row: rowNumber,
                field: 'Company Name',
                severity: 'error',
                code: 'REQUIRED',
                message: 'Company Name is required.',
              });
              errors += 1;
              continue;
            }
            if (existingNames.has(name.toLowerCase())) {
              job.issues.push({
                row: rowNumber,
                field: 'Company Name',
                severity: 'error',
                code: 'DUPLICATE',
                message: `${name} already exists.`,
              });
              errors += 1;
              continue;
            }
            const email = emailIndex >= 0 ? (row[emailIndex] ?? '').trim() : '';
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              job.issues.push({
                row: rowNumber,
                field: 'Primary Email',
                severity: 'error',
                code: 'INVALID_EMAIL',
                message: 'Value is not a valid email address.',
              });
              errors += 1;
              continue;
            }
            let rowWarning = false;
            const rawSegment =
              segmentIndex >= 0
                ? (row[segmentIndex] ?? '').trim().toLowerCase().replace(/[- ]/g, '_')
                : '';
            const segment =
              (['smb', 'mid_market', 'enterprise', 'strategic'] as const).find(
                (candidate) => candidate === rawSegment,
              ) ?? 'smb';
            if (rawSegment && segment !== rawSegment) {
              job.issues.push({
                row: rowNumber,
                field: 'Segment',
                severity: 'warning',
                code: 'UNKNOWN_SEGMENT',
                message: `Segment "${row[segmentIndex]}" not recognised; defaulted to SMB.`,
              });
              rowWarning = true;
            }
            const rawTerms =
              termsIndex >= 0
                ? (row[termsIndex] ?? '').trim().toUpperCase().replace(/\s+/g, '_')
                : '';
            const terms =
              (['DUE_ON_RECEIPT', 'NET_15', 'NET_30', 'NET_45', 'NET_60'] as const).find(
                (candidate) => candidate === rawTerms,
              ) ?? 'NET_30';
            if (rawTerms && terms !== rawTerms) {
              job.issues.push({
                row: rowNumber,
                field: 'Payment Terms',
                severity: 'warning',
                code: 'UNKNOWN_TERMS',
                message: `Payment terms "${row[termsIndex]}" are not supported; defaulted to NET_30.`,
              });
              rowWarning = true;
            }
            const customerId = runtime.store.nextId('customer');
            tx.create('customers', {
              id: customerId,
              organizationId: runtime.store.dataset.organization.id,
              accountNumber: runtime.store.nextBusinessNumber('customer'),
              regionCode: 'US',
              legalName: name,
              displayName: name,
              status: 'prospect',
              segment,
              industry: 'Unknown',
              accountOwnerId: tx.actor.id,
              salesTeamId:
                [...runtime.store.dataset.teams.values()].find((team) => team.type === 'sales')
                  ?.id ?? '',
              paymentTermsCode: terms,
              creditLimit: { currency: 'USD', minor: 0 },
              priceListId:
                [...runtime.store.dataset.priceLists.values()].find(
                  (list) => list.name === 'Standard',
                )?.id ?? '',
              taxProfile: { type: 'taxable' },
              preferredCurrency: 'USD',
              customerSince: runtime.store.today,
              health: 'healthy',
              tags: ['imported'],
              metadata: metadata(tx, customerId),
            });
            existingNames.add(name.toLowerCase());
            imported += 1;
            if (rowWarning) warnings += 1;
          }
          job.result = {
            totalRows: input.rows.length,
            validRows: input.rows.length - errors,
            warningRows: warnings,
            errorRows: errors,
            importedRows: imported,
            skippedRows: errors,
          };
          job.status = errors > 0 ? 'completed_with_errors' : 'completed';
          job.metadata.version = 2;
          tx.dirty('importJobs', job);
          tx.audit('import.completed', 'import_job', id, { nextVersion: 2 });
          return job;
        },
      ),
  };

  return { workflows, notifications, tasks, savedViews, imports };
}

export type PlatformCommands = ReturnType<typeof createPlatformCommands>;
export { getWorkflow };
