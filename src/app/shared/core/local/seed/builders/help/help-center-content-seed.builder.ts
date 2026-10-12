import { HelpCenterContentBuilder } from '../../../../base/builders/help/help-center-content.builder';
import type { GuideDocumentKind, GuideRevision } from '@fssrepository/myscoutee-components';
import revisions from '../../data/help-center-revisions.json';
export class SeedHelpCenterContentBuilder {
 static documentLabel = HelpCenterContentBuilder.documentLabel;
 static defaultRevision(kind: GuideDocumentKind, lang = 'en', contextKey?: string | null, _translate?: (key: string) => string): GuideRevision {
  const revision = revisions.find(item => item.documentKind === kind && item.lang === lang && (kind !== 'explanation' || item.contextKey === contextKey));
  if (!revision) throw new Error('Missing template content seed: ' + kind + ':' + lang + ':' + (contextKey ?? ''));
  return structuredClone(revision) as GuideRevision;
 }
 static explanationBootstrapContextKeys(): string[] { return [...new Set(revisions.filter(item => item.documentKind === 'explanation').map(item => item.contextKey))]; }
}
