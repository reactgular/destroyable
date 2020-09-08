import {Directive, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';

/**
 * A simple class that emits a destruction event.
 */
@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class Destroyable implements OnDestroy {
  /**
   * Emits when the object is destroyed by the Angular framework.
   */
  protected readonly _destroyed$: Subject<void> = new Subject<void>();

  /**
   * You must call super.ngOnDestroy()
   */
  public ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
