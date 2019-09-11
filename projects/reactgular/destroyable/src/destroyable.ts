import {OnDestroy} from '@angular/core';
import {Observable, Subject} from 'rxjs';

/**
 * A simple class that emits a destruction event.
 */
export abstract class Destroyable implements OnDestroy {
  /**
   * Emits when the object is destroyed by the Angular framework.
   */
  protected readonly _destroyed$: Subject<void> = new Subject<void>();

  /**
   * Emits when the object is destroyed by the Angular framework.
   */
  public get destroyed(): Observable<void> {
    return this._destroyed$.asObservable();
  }

  /**
   * Emits when the object is destroyed by the Angular framework.
   */
  public get destroyed$(): Observable<void> {
    return this._destroyed$.asObservable();
  }

  /**
   * You must call super.ngOnDestroy()
   */
  public ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
