import {Component, Type, ViewChild} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Observable} from 'rxjs';

export interface DestroyableObservable {
  _destroyed$: Observable<void>;
}

export interface FixtureProperties<TType> {
  create: boolean;

  ref: TType & DestroyableObservable;
}

export const fixtureFactory = <TType>(component: Type<TType>, selector: string): Type<any> => {
  // noinspection AngularMissingOrInvalidDeclarationInModule
  @Component({
    template: `
      <rg-${selector} #ref *ngIf="create"></rg-${selector}>
    `
  })
  class FixtureComponent implements FixtureProperties<TType> {
    public create: boolean = true;

    @ViewChild('ref')
    public ref: TType & DestroyableObservable;
  }

  return FixtureComponent;
};

export const testFixture = <TType>(fixtureComponent: Type<FixtureProperties<TType>>): [TType, number, boolean] => {
  const fixture = TestBed.createComponent(fixtureComponent);
  fixture.detectChanges();

  const inst = fixture.componentInstance;
  const ref = fixture.componentInstance.ref;

  let count = 0;
  let closed = false;

  if (ref) {
    const sub = ref._destroyed$.subscribe(() => count++);
    inst.create = false;
    fixture.detectChanges();
    closed = sub.closed;
  }

  return [ref, count, closed];
};

export const buildFixture = async <TType>(component: Type<TType>): Promise<Type<FixtureProperties<TType>>> => {
  const fixtureComponent: Type<FixtureProperties<TType>> = fixtureFactory(component, 'destroyable');

  await TestBed.configureTestingModule({
    declarations: [
      component,
      fixtureComponent
    ]
  }).compileComponents();

  return fixtureComponent;
};
