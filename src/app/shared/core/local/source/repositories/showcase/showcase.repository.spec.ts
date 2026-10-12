import { TestBed } from '@angular/core/testing';
import { LocalMemoryDb } from '../../../../common/app.db';
import { SeedShowcaseRepository } from '../../../seed/repositories/showcase/showcase-seed.repository';
import { LocalShowcaseRepository } from './showcase.repository';
import type { ShowcaseMemorySchema } from '../../entity/showcase/showcase.entity';

describe('template sample-card persistence', () => {
  let state: ShowcaseMemorySchema;
  beforeEach(() => {
    state = { sampleCards: { byId: {}, ids: [] } };
    TestBed.configureTestingModule({ providers: [{ provide: LocalMemoryDb, useValue: {
      whenReady: () => Promise.resolve(), read: () => state,
      write: (update: (state: ShowcaseMemorySchema) => ShowcaseMemorySchema) => { state = update(state); }
    } }] });
  });
  afterEach(() => TestBed.resetTestingModule());
  it('seeds once and preserves saved changes on subsequent entry', () => {
    const seed = TestBed.inject(SeedShowcaseRepository);
    seed.seedDefaults();
    const id = state.sampleCards.ids[0];
    state.sampleCards.byId[id].title = 'My saved card';
    seed.seedDefaults();
    expect(state.sampleCards.ids.length).toBe(4);
    expect(state.sampleCards.byId[id].title).toBe('My saved card');
  });
  it('returns stable separate pages and does not expose writable stored records', async () => {
    TestBed.inject(SeedShowcaseRepository).seedDefaults();
    state.sampleCards.ids.reverse();
    const repository = TestBed.inject(LocalShowcaseRepository);
    const first = await repository.queryPage(0,2), second = await repository.queryPage(1,2);
    expect(first.items.map(card => card.title)).toEqual(['Coastal light','Quiet peaks']);
    expect(second.items.map(card => card.title)).toEqual(['Desert rhythm','Forest canopy']);
    expect(first.total).toBe(4);
    first.items[0].title = 'Changed outside storage';
    expect((await repository.queryPage(0,2)).items[0].title).toBe('Coastal light');
    expect((await repository.queryPage(2,2)).items).toEqual([]);
  });
});
