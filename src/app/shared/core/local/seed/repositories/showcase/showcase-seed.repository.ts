import { Injectable, inject } from '@angular/core';
import { LocalMemoryDb } from '../../../../common/app.db';
import cards from '../../data/sample-cards.json';
@Injectable({ providedIn: 'root' })
export class SeedShowcaseRepository {
  private readonly db = inject(LocalMemoryDb);
  seedDefaults(): void {
    const table = this.db.read().sampleCards;
    const missing = cards.filter(card => !table.byId[card.id] || Object.keys(card).some(key =>
      !(key in table.byId[card.id])));
    if (!missing.length) return;
    this.db.write(state => ({ ...state, sampleCards: {
      byId: { ...state.sampleCards.byId, ...Object.fromEntries(missing.map(card =>
        [card.id, { ...structuredClone(card), ...state.sampleCards.byId[card.id] }])) },
      ids: [...new Set([...state.sampleCards.ids, ...missing.map(card => card.id)])]
    } }));
  }
}
