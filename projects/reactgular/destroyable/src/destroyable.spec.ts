import {Component, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
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
  @ViewChild(DestroyableComponent)
  public destroyableComponent: DestroyableComponent;

  public toggle: boolean = true;
}

/**
 * @todo add a test for forgetting to call super via destroy (to show it breaks).
 * @todo add a test for catching destroy via takeUntil to show proper usage.
 */
describe('destroyable', () => {
  let component: ExampleComponent;
  let fixture: ComponentFixture<ExampleComponent>;

  beforeEach(waitForAsync(() => {
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
