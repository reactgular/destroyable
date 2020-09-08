import {Component, Directive, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {mixinDestroyable} from './mixin-destroyable';

/**
 * Defines a base class that records if life cycle hooks are called.
 */
@Directive()
class BaseDirective implements OnInit, OnDestroy {
  public baseDestroyed: boolean = false;

  public baseInit: boolean = false;

  public baseThrow: boolean = false;

  public ngOnDestroy(): void {
    this.baseDestroyed = true;
    if (this.baseThrow) {
      throw new Error('Destroyable');
    }
  }

  public ngOnInit(): void {
    this.baseInit = true;
  }
}

/**
 * Takes numbers from an observable and stores them in an array for as long as the component is alive.
 */
@Component({
  selector: 'rg-mixin-destroyable',
  template: ''
})
class MixinDestroyableComponent extends mixinDestroyable(BaseDirective) implements OnInit, OnDestroy {
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
    super.ngOnInit();

    this.value$.pipe(
      takeUntil(this._destroyed$)
    ).subscribe(value => this.values = [...this.values, value]);
  }
}

@Component({template: '<rg-mixin-destroyable *ngIf="create"></rg-mixin-destroyable>'})
class FixtureComponent {
  public create: boolean = true;

  @ViewChild(MixinDestroyableComponent)
  public rgDestroyable: MixinDestroyableComponent;

  public destroyIt() {
    this.create = false;
  }
}

describe(mixinDestroyable.name, () => {
  let fixture: ComponentFixture<FixtureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        MixinDestroyableComponent,
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
    const destroyable = fixture.componentInstance.rgDestroyable;
    expect(destroyable).toBeTruthy();
  });

  it('should not have destroyed the component', () => {
    const destroyable = fixture.componentInstance.rgDestroyable;
    expect(destroyable.isDestroyed).toBeFalsy();
  });

  it('should call ngOnInit on the base class', () => {
    const destroyable = fixture.componentInstance.rgDestroyable;
    expect(destroyable.baseInit).toBeTruthy();
  });

  it('should not have called ngOnDestroy when creating the base class', () => {
    const destroyable = fixture.componentInstance.rgDestroyable;
    expect(destroyable.baseDestroyed).toBeFalsy();
  });

  it('should throw an error from the base class destroy', () => {
    const inst = fixture.componentInstance;
    const destroyable = fixture.componentInstance.rgDestroyable;
    destroyable.baseThrow = true;

    expect(() => {
      inst.destroyIt();
      fixture.detectChanges();
    }).toThrow(new Error('Destroyable'));
  });

  it('should call ngOnDestroy on the base class', () => {
    const inst = fixture.componentInstance;
    const destroyable = fixture.componentInstance.rgDestroyable;

    inst.destroyIt();
    fixture.detectChanges();

    expect(destroyable.baseDestroyed).toBeTruthy();
  });

  it('should have no emitted numbers when created', () => {
    const destroyable = fixture.componentInstance.rgDestroyable;
    expect(destroyable.values).toEqual([]);
  });

  it('should cache emitted numbers', () => {
    const inst = fixture.componentInstance;
    const destroyable = inst.rgDestroyable;

    destroyable.value$.next(1);
    destroyable.value$.next(2);
    destroyable.value$.next(3);

    fixture.detectChanges();

    expect(destroyable.values).toEqual([1, 2, 3]);
  });

  it('should stop caching emitted numbers after it is destroyed', () => {
    const inst = fixture.componentInstance;
    const destroyable = inst.rgDestroyable;

    expect(destroyable.values).toEqual([]);

    destroyable.value$.next(1);
    destroyable.value$.next(2);
    destroyable.value$.next(3);

    fixture.detectChanges();

    expect(destroyable.values).toEqual([1, 2, 3]);

    inst.destroyIt();
    fixture.detectChanges();

    expect(destroyable.isDestroyed).toBeTruthy();

    destroyable.value$.next(4);
    destroyable.value$.next(5);
    destroyable.value$.next(6);

    fixture.detectChanges();

    expect(destroyable.values).toEqual([1, 2, 3]);
  });

  it('should stop caching emitted numbers even if base class throws error from destroy', () => {
    const inst = fixture.componentInstance;
    const destroyable = inst.rgDestroyable;

    expect(destroyable.values).toEqual([]);

    destroyable.value$.next(1);
    destroyable.value$.next(2);
    destroyable.value$.next(3);

    fixture.detectChanges();

    expect(destroyable.values).toEqual([1, 2, 3]);

    expect(() => {
      destroyable.baseThrow = true;
      inst.destroyIt();
      fixture.detectChanges();
    }).toThrow(new Error('Destroyable'));

    expect(destroyable.isDestroyed).toBeFalsy();

    destroyable.value$.next(4);
    destroyable.value$.next(5);
    destroyable.value$.next(6);

    fixture.detectChanges();

    expect(destroyable.values).toEqual([1, 2, 3]);
  });
});
