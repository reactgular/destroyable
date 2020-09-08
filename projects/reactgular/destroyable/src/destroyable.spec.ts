import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Destroyable} from './destroyable';

/**
 * Takes numbers from an observable and stores them in an array for as long as the component is alive.
 */
@Component({
  selector: 'rg-destroyable',
  template: ''
})
class DestroyableComponent extends Destroyable implements OnInit, OnDestroy {
  /**
   * Extended classes must call super if they implement OnDestroy, but if they do not override the ngOnDestroy then it is not necessary.
   */
  public callSuperDestroy: boolean = true;

  /**
   * True after being destroyed.
   */
  public isDestroyed: boolean = false;

  /**
   * Allows externals to emit values.
   */
  public readonly value$: Subject<number> = new Subject<number>();

  /**
   * A cache of subscribed values.
   */
  public values: number[] = [];

  public ngOnDestroy() {
    if (this.callSuperDestroy) {
      super.ngOnDestroy();
    }
    this.isDestroyed = true;
  }

  public ngOnInit(): void {
    this.value$.pipe(
      takeUntil(this._destroyed$)
    ).subscribe(value => this.values = [...this.values, value]);
  }
}

@Component({template: '<rg-destroyable *ngIf="create"></rg-destroyable>'})
class FixtureComponent {
  public create: boolean = true;

  @ViewChild(DestroyableComponent)
  public rgDestroyable: DestroyableComponent;

  public destroyIt() {
    this.create = false;
  }
}

describe(Destroyable.name, () => {
  let fixture: ComponentFixture<FixtureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        DestroyableComponent,
        FixtureComponent
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixtureComponent);
    fixture.detectChanges();
  });

  it('should create the component instance', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should create the destroyable component', () => {
    expect(fixture.componentInstance.rgDestroyable).toBeTruthy();
  });

  it('should have no emitted numbers when created', () => {
    expect(fixture.componentInstance.rgDestroyable.values).toEqual([]);
    expect(fixture.componentInstance.rgDestroyable.isDestroyed).toBeFalsy();
  });

  it('should cache emitted numbers', () => {
    const inst = fixture.componentInstance;
    const destroyable = inst.rgDestroyable;

    expect(destroyable.values).toEqual([]);
    destroyable.value$.next(1);
    destroyable.value$.next(2);
    expect(destroyable.values).toEqual([1, 2]);
  });

  it('should stop caching emitted numbers after it is destroyed', () => {
    const inst = fixture.componentInstance;
    const destroyable = inst.rgDestroyable;

    expect(destroyable.values).toEqual([]);
    destroyable.value$.next(1);
    destroyable.value$.next(2);
    destroyable.value$.next(3);
    expect(destroyable.values).toEqual([1, 2, 3]);

    inst.destroyIt();
    fixture.detectChanges();

    expect(destroyable.isDestroyed).toBeTruthy();

    destroyable.value$.next(4);
    destroyable.value$.next(5);
    destroyable.value$.next(6);
    expect(destroyable.values).toEqual([1, 2, 3]);
  });

  it('should not unsubscribe if super.ngOnDestroy() is not called', () => {
    const inst = fixture.componentInstance;
    const destroyable = inst.rgDestroyable;

    expect(destroyable.values).toEqual([]);
    destroyable.value$.next(1);
    destroyable.value$.next(2);
    destroyable.value$.next(3);
    expect(destroyable.values).toEqual([1, 2, 3]);

    destroyable.callSuperDestroy = false;
    inst.destroyIt();
    fixture.detectChanges();

    expect(destroyable.isDestroyed).toBeTruthy();

    destroyable.value$.next(4);
    destroyable.value$.next(5);
    destroyable.value$.next(6);
    expect(destroyable.values).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
