import { DomainError } from './errors';

export type IdPrefix =
  | 'org' | 'usr' | 'tem' | 'rol' | 'ras' | 'wh' | 'ntf' | 'tsk' | 'apr' | 'act'
  | 'cus' | 'con' | 'sku' | 'ord' | 'quo' | 'inv' | 'sup' | 'po' | 'tck' | 'shp' | 'req';

const ID_PATTERN = /^([a-z]+)_(\d{6})$/;

export function makeId(prefix: IdPrefix, sequence: number): string {
  return `${prefix}_${String(sequence).padStart(6, '0')}`;
}

export function parseId(id: string): { prefix: IdPrefix; sequence: number } {
  const match = ID_PATTERN.exec(id);
  if (match === null) throw new DomainError('VALIDATION_FAILED', `Malformed id: ${id}`, { id });
  return { prefix: match[1] as IdPrefix, sequence: Number(match[2]) };
}
