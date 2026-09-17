export type DomainErrorCode = 'FORBIDDEN' | 'NOT_FOUND' | 'INVALID_STATE_TRANSITION' | 'VALIDATION_FAILED';

export class DomainError extends Error {
  constructor(
    readonly code: DomainErrorCode,
    message: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
