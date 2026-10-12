import type { SampleCardDto } from '../../../../contracts/showcase/showcase.interface';
import { APP_INDEXED_DB_KEYS } from '../../../../common/storage-scope';
export const SAMPLE_CARDS_TABLE_NAME = APP_INDEXED_DB_KEYS.sampleCards;
export interface SampleCardsTable { byId: Record<string, SampleCardDto>; ids: string[]; }
export type ShowcaseMemorySchema = Record<typeof SAMPLE_CARDS_TABLE_NAME, SampleCardsTable>;
