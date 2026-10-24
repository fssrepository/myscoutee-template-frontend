export const POPUP_ADAPTER = {
  APP_SETUP: 'src/app/shared/ui/components/app-setup-popup/app-setup-popup.component.ts',
  DOCUMENT_VIEWER: 'src/app/shared/ui/components/document-viewer/document-viewer.component.ts',
  ENTRY_AUTH: 'src/app/entry/components/entry-firebase-auth-popup/entry-firebase-auth-popup.component.ts'
} as const;

export const POPUP_ADAPTER_LOADERS = {
  [POPUP_ADAPTER.APP_SETUP]: () => import('../components/app-setup-popup/app-setup-popup.component'),
  [POPUP_ADAPTER.DOCUMENT_VIEWER]: () => import('../components/document-viewer/document-viewer.component'),
  [POPUP_ADAPTER.ENTRY_AUTH]: () => import('../../../entry/components/entry-firebase-auth-popup/entry-firebase-auth-popup.component')
};

export type PopupAdapterKey = keyof typeof POPUP_ADAPTER_LOADERS;
export type PopupAdapterModule<K extends PopupAdapterKey> = Awaited<ReturnType<(typeof POPUP_ADAPTER_LOADERS)[K]>>;
