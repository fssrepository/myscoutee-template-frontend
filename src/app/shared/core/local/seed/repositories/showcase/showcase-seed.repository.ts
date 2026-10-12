import { Injectable, inject } from '@angular/core';
import { LocalMemoryDb } from '../../../../common/app.db';
import cards from '../../data/sample-cards.json';
@Injectable({ providedIn: 'root' })
export class SeedShowcaseRepository {
  private readonly db = inject(LocalMemoryDb);
  seedDefaults(): void {
    const table = this.db.read().sampleCards;
    const missing = cards.filter(card => Object.entries(card).some(([key, value]) =>
      table.byId[card.id]?.[key as keyof typeof card] !== value));
    if (!missing.length) return;
    this.db.write(state => ({ ...state, sampleCards: {
      byId: { ...state.sampleCards.byId, ...Object.fromEntries(missing.map(card => [card.id, structuredClone(card)])) },
      ids: [...new Set([...state.sampleCards.ids, ...missing.map(card => card.id)])]
    } }));
  }
}
