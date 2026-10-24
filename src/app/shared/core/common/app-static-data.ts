import type { HelpCenterDocumentKind as GuideDocumentKind } from '../contracts/content/content.interface';
import type { HelpCenterHeaderColor as GuideHeaderColor } from '../contracts/content/content.interface';

import type { ExplainableSurface } from '../contracts/content/content.interface';
import type { DocumentViewerHeaderPalette } from '../../ui/components/document-viewer/document-viewer.types';
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
 documentDescriptionsByLang: {
  "en": {
    "help": "Explore the example list, open a conversation and edit your profile from the avatar menu.",
    "privacy": "This demonstration stores profile, conversation and consent data in the selected local or server environment. A deployed project must provide its own data controller and privacy information before inviting real users.",
    "terms": "Use the seeded demonstration accounts to explore the application. Replace this demonstration document with the terms of your own project before inviting real users.",
    "explanation": "Example cards"
  },
  "hu": {
    "help": "Fedezd fel a mintakártyákat, nyiss meg egy beszélgetést, és szerkeszd a profilodat az avatármenüből.",
    "privacy": "Ez a bemutató profil-, beszélgetés- és hozzájárulási adatokat tárol a kiválasztott helyi vagy szerverkörnyezetben. Valódi felhasználók meghívása előtt a saját projekt adatkezelőjét és adatvédelmi tájékoztatóját kell megadni.",
    "terms": "Az előre létrehozott bemutatófiókokkal kipróbálhatod az alkalmazást. Valódi felhasználók meghívása előtt ezt a bemutatódokumentumot a saját projekted feltételeire kell cserélni.",
    "explanation": "Mintakártyák"
  }
} satisfies Record<'en' | 'hu', Record<GuideDocumentKind, string>>
};
