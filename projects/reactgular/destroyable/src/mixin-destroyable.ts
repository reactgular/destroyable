import {OnDestroy} from '@angular/core';
import {Observable, Subject} from 'rxjs';

/**
 * Defines what properties will exist on the component after applying the mixin.
 */
export interface DestroyableProp extends OnDestroy {
  /**
   * Emits when the object is destroyed by the Angular framework.
   */
  _destroyed$: Observable<void>;
}

type Constructor<TYpe extends {} = {}> = new (...args: any[]) => TYpe;

export type MixedDestroyableCtor = Constructor<DestroyableProp>;

/**
 * You can mixin a different base class with your Angular component by using this variant of the Destroyable class.
 *
 * For example;
 *
 * ```TypeScript
 * @Directive()
 * class BaseDirective {}
 *
 * @Component({selector: 'example' template: ''})
 * export class ExampleComponent extends mixinDestroyable(BaseDirective) {}
 * ```
 */
export function mixinDestroyable<TBase extends Constructor>(base: TBase): MixedDestroyableCtor & TBase {
  return class MixinDestroyable extends base implements OnDestroy {
    _destroyed$: Subject<void> = new Subject<void>();

    /**
     * You must call super.ngOnDestroy() on your derived class if you override the method.
     */
    public ngOnDestroy(): void {
      try {
        if (typeof super['ngOnDestroy'] === 'function') {
          super['ngOnDestroy']();
        }
      } finally {
        this._destroyed$.next();
        this._destroyed$.complete();
      }
    }
  };
}
