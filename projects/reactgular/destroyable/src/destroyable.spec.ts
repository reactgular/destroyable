import {Component, ViewChild} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {forkJoin} from 'rxjs';
import {Destroyable} from './destroyable';

@Component({
  selector: 'rg-destroyable',
  template: ''
})
class DestroyableComponent extends Destroyable {
}

@Component({template: '<rg-destroyable *ngIf="toggle"></rg-destroyable>'})
class ExampleComponent {
  @ViewChild(DestroyableComponent, {static: false})
  public destroyableComponent: DestroyableComponent;

  public toggle: boolean = true;
}

describe('destroyable', () => {
  let component: ExampleComponent;
  let fixture: ComponentFixture<ExampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DestroyableComponent,
        ExampleComponent
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should emit when the component is destroyed', (done: DoneFn) => {
    expect(component).toBeTruthy();
    const destroyable = component.destroyableComponent;
    expect(destroyable).toBeTruthy();

    forkJoin([
      destroyable['_destroyed$'],
      destroyable.destroyed,
      destroyable.destroyed$
    ]).subscribe(() => done());

    component.toggle = false;
    fixture.detectChanges();
  });
});
