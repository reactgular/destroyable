import {OnDestroy} from '@angular/core';
import {Observable, Subject} from 'rxjs';

type Constructor<TYpe extends {} = {}> = new (...args: any[]) => TYpe;

export interface MixedDestroyable {
  _destroyed$: Observable<void>;
}

export type MixedDestroyableCtor = Constructor<MixedDestroyable>;

export function mixinDestroyable<TBase extends Constructor<OnDestroy>>(base: TBase): MixedDestroyableCtor & TBase {
  return class MixinDestroyableClass extends base implements OnDestroy {
    /**
     * Emits when the object is destroyed by the Angular framework.
     */
    _destroyed$: Subject<void> = new Subject<void>();

    /**
     * You must call super.ngOnDestroy()
     */
    public ngOnDestroy(): void {
      try {
        if (typeof super.ngOnDestroy === 'function') {
          super.ngOnDestroy();
        }
      } finally {
        this._destroyed$.next();
        this._destroyed$.complete();
      }
    }
  };
}


