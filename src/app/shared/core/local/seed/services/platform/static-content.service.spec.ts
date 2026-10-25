import { TestBed } from '@angular/core/testing';
import { I18nService } from '../../../../base/services/localization/i18n.service';
import { LocalMemoryDb } from '../../../../common/app.db';
import { HELP_CENTER_TABLE_NAME } from '../../../source/entity/content/content.entity';
import { SeedHelpCenterRepository } from '../../repositories/help/help-center-seed.repository';
import { SeedStaticContentService } from './static-content.service';

describe('Landing content language', () => {
  let language: string;
  const ensureLanguageLoaded = vi.fn().mockResolvedValue(undefined);

  beforeEach(async () => {
    language = 'hu';
    ensureLanguageLoaded.mockClear();
    TestBed.configureTestingModule({ providers: [
      { provide: I18nService, useValue: {
        currentLanguage: () => language, ensureLanguageLoaded,
        translateForLanguage: (key: string) => key
      } }
    ] });
    await TestBed.inject(LocalMemoryDb).resetStorage();
  });
  afterEach(() => TestBed.resetTestingModule());

  it.each(['en', 'hu'])('prepares only the current %s landing language', async lang => {
    language = lang;
    await TestBed.inject(SeedStaticContentService).ensureReady();
    expect(new Set(ensureLanguageLoaded.mock.calls.map(([value]) => value))).toEqual(new Set([lang]));
    const table = TestBed.inject(LocalMemoryDb).read()[HELP_CENTER_TABLE_NAME];
    expect(new Set(Object.values(table.revisionsById).map(row => row.lang))).toEqual(new Set([lang]));
    expect(table.activeRevisionIdsByKind?.[`privacy:${lang}`]).toBeTruthy();
    expect(table.activeRevisionIdsByKind?.[`terms:${lang}`]).toBeTruthy();
  });

  it('still prepares every language for the existing admin bootstrap', async () => {
    await TestBed.inject(SeedStaticContentService).ensureReady();
    await TestBed.inject(SeedHelpCenterRepository).seedDefaults();
    const table = TestBed.inject(LocalMemoryDb).read()[HELP_CENTER_TABLE_NAME];
    expect(new Set(Object.values(table.revisionsById).map(row => row.lang))).toEqual(new Set(['en', 'hu']));
  });
});
