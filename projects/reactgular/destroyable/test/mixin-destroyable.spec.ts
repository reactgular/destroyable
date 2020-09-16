import {Component, Directive, OnDestroy} from '@angular/core';
import {waitForAsync} from '@angular/core/testing';
import {mixinDestroyable} from '../src/mixin-destroyable';
import {buildFixture, testFixture} from './test-utils';

@Directive()
class SimpleDirective {
}

@Directive()
class DestroyCalledDirective implements OnDestroy {
  public destroyCalled: boolean = false;

  public ngOnDestroy(): void {
    this.destroyCalled = true;
  }
}

@Component({
  selector: 'rg-destroyable',
  template: ''
})
export class MixinDestroyableComponent extends mixinDestroyable(SimpleDirective) {
}

@Component({
  selector: 'rg-destroyable',
  template: ''
})
export class MixinDestroyCalledComponent extends mixinDestroyable(DestroyCalledDirective) {
}

describe('does _destroy$ emit when destroyed', () => {
  it('should emit destroyed when using mixinDestroyable', waitForAsync(async () => {
    const fixture = await buildFixture(MixinDestroyableComponent);
    const [ref, count, closed] = testFixture(fixture);

    expect(ref).toBeTruthy();
    expect(count).toBe(1);
    expect(closed).toBeTruthy();
  }));

  it('should call ngOnDestroy for base class when using mixinDestroyable', waitForAsync(async () => {
    const fixture = await buildFixture(MixinDestroyCalledComponent);
    const [ref, count, closed] = testFixture(fixture);

    expect(ref).toBeTruthy();
    expect(count).toBe(1);
    expect(closed).toBeTruthy();
    expect(ref.destroyCalled).toBeTruthy();
  }));
});
