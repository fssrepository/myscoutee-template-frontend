import { Injectable } from '@angular/core';
import { POPUP_ADAPTER_LOADERS, type PopupAdapterKey, type PopupAdapterModule } from './popup-adapter-loaders';

@Injectable({ providedIn: 'root' })
export class PopupAdapterProxyService {
  private readonly modules = new Map<PopupAdapterKey, Promise<unknown>>();

  load<K extends PopupAdapterKey>(key: K): Promise<PopupAdapterModule<K>> {
    let pending = this.modules.get(key);
    if (!pending) {
      const load: () => Promise<unknown> = POPUP_ADAPTER_LOADERS[key];
      pending = Promise.resolve().then(load);
      this.modules.set(key, pending);
      const attempt = pending;
      void pending.catch(() => {
        if (this.modules.get(key) === attempt) this.modules.delete(key);
      });
    }
    return pending as Promise<PopupAdapterModule<K>>;
  }
}
