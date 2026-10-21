import { APP_STATIC_DATA } from '../../../common/app-static-data';
import revisions from '../../../local/seed/data/help-center-revisions.json';
import { HelpCenterContentBuilder } from './help-center-content.builder';

describe('Help document description metadata', () => {
  for (const lang of ['en', 'hu'] as const) {
    for (const kind of ['help', 'privacy', 'terms', 'explanation'] as const) {
      it(`retains the ${lang} ${kind} description without a runtime seed dependency`, () => {
        const seed = revisions.find(row => row.documentKind === kind && row.lang === lang
          && (kind !== 'explanation' || row.contextKey === 'home'));
        expect(APP_STATIC_DATA.documentDescriptionsByLang[lang][kind]).toBe(seed?.description);
      });
    }
  }

  it('retains the existing empty English explanation default and Hungarian privacy wording', () => {
    expect(HelpCenterContentBuilder.defaultDescription('explanation', 'en')).toBe('');
    expect(HelpCenterContentBuilder.defaultDescription('privacy', 'hu')).toBe(
      'Folytatás előtt nézd át és fogadd el, hogyan használja az alkalmazás az adataidat.');
  });
});
