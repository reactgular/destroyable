import {Component} from '@angular/core';
import {waitForAsync} from '@angular/core/testing';
import {Destroyable} from './destroyable';
import {buildFixture, testFixture} from '../test/fixture-factory';

@Component({
  selector: 'rg-destroyable',
  template: ''
})
export class DestroyableComponent extends Destroyable {
}

describe('does _destroy$ emit when destroyed', () => {
  it('should emit destroyed when extending Destroyable', waitForAsync(async () => {
    const fixture = await buildFixture(DestroyableComponent);
    const [ref, count, closed] = testFixture(fixture);

    expect(ref).toBeTruthy();
    expect(count).toBe(1);
    expect(closed).toBeTruthy();
  }));
});
