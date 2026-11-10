import { type Row } from '../core/config.ts';
import { select } from './supabase.ts';
import { previewMode, previewRows } from './repository.ts';

export async function sponsors(): Promise<Row[]> {
  return previewMode()
    ? previewRows('sponsors')
    : select('sponsors', {}, 'sort_order.asc,id.asc');
}
