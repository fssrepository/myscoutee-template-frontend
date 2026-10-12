import type { GuideHeaderColor, GuideRevision } from '@fssrepository/myscoutee-components';
import type { ExplainableSurface } from '../contracts/content/content.interface';
import type { DocumentViewerHeaderPalette } from '../../ui/components/document-viewer/document-viewer.types';
import revisions from '../local/seed/data/help-center-revisions.json';
const revision = (kind: string, lang = 'en'): GuideRevision => {
 const value = revisions.find(item => item.documentKind === kind && item.lang === lang && (kind !== 'explanation' || item.contextKey === 'home'));
 if (!value) throw new Error('Missing template document: ' + kind);
 return value as GuideRevision;
};
export const APP_STATIC_DATA = {
 profileStatusOptions: [
  { value: 'public', icon: 'public' },
  { value: 'friends only', icon: 'groups' },
  { value: 'host only', icon: 'stadium' },
  { value: 'inactive', icon: 'visibility_off' }
 ] as const,
 documentViewerHeaderPalettes: ['amber','blue','green','rose','violet','slate','teal'] as readonly DocumentViewerHeaderPalette[],
 contentLanguages: [{ lang: 'en', label: 'English' }, { lang: 'hu', label: 'Magyar' }],
 helpCenterHeaderColors: ['amber','blue','green','rose','violet','slate'] as readonly GuideHeaderColor[],
 explainableSurfaces: [

  {key:'operator.updates',label:'Updates',icon:'system_update_alt',owner:'popup',order:51,enabled:true},
  { key: 'operator.configuration', label: 'Deployment configuration', icon: 'settings', owner: 'popup', order: 50, enabled: true },
  { key: 'profile.integrations', label: 'Integrations', icon: 'hub', owner: 'popup', order: 43, enabled: true },
  { key: 'profile.mcp-authorization', label: 'Connect an AI client', icon: 'help_outline', owner: 'popup', order: 43.3, enabled: true },
  { key: 'profile.mcp-advanced', label: 'Manual MCP clients', icon: 'help_outline', owner: 'popup', order: 43.4, enabled: true },
  { key: 'profile.mcp-details', label: 'MCP connection details', icon: 'help_outline', owner: 'popup', order: 43.5, enabled: true },
  { key: 'profile.integration-help', label: 'API / MCP help', icon: 'help_outline', owner: 'popup', order: 43.2, enabled: true },
  { key: 'profile.integration-access', label: 'Integration permissions', icon: 'admin_panel_settings', owner: 'popup', order: 43.1, enabled: true },
  {key:"landing.setup",label:"Device setup",icon:"tune",owner:"popup",order:7,enabled:true,isSystem:true},{key:"landing.entry",label:"Getting started",icon:"login",owner:"route",order:6,enabled:true,isSystem:true},{"key": "home", "label": "Example cards", "icon": "dashboard", "owner": "route", "order": 0, "enabled": true, "isSystem": true}, {"key": "navigation", "label": "Your menu", "icon": "account_circle", "owner": "popup", "order": 1, "enabled": true, "isSystem": true}, {"key": "chat", "label": "Chat", "icon": "chat", "owner": "route", "order": 2, "enabled": true, "isSystem": true}, {"key": "profile", "label": "Your profile", "icon": "person", "owner": "popup", "order": 3, "enabled": true, "isSystem": true}, {"key": "notifications", "label": "Notifications", "icon": "notifications", "owner": "popup", "order": 4, "enabled": true, "isSystem": true}, {"key": "landing.guide", "label": "Using the guide", "icon": "tips_and_updates", "owner": "popup", "order": 5, "enabled": true, "isSystem": true}] as readonly ExplainableSurface[],
 defaultHelpCenterDescription: revision('help').description,
 defaultPrivacyCenterDescription: revision('privacy').description,
 defaultTermsCenterDescription: revision('terms').description,
 defaultExplanationHomeRevision: revision('explanation'),
 defaultHelpCenterRevisionsByLang: { en: revision('help'), hu: revision('help', 'hu') },
 defaultPrivacyCenterRevisionsByLang: { en: revision('privacy'), hu: revision('privacy', 'hu') },
 defaultTermsCenterRevisionsByLang: { en: revision('terms'), hu: revision('terms', 'hu') },
 defaultExplanationHomeRevisionsByLang: { en: revision('explanation'), hu: revision('explanation', 'hu') }
};
