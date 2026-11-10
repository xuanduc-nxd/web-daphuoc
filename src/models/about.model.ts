import { type Row } from '../core/config.ts';
import { select } from './supabase.ts';
import { previewMode, previewRows } from './repository.ts';

export async function aboutSections(): Promise<Row[]> {
  return previewMode()
    ? previewRows('about_sections')
    : select('about_sections', {}, 'sort_order.asc,id.asc');
}
