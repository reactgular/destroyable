[![Build Status](https://travis-ci.org/reactgular/destroyable.svg?branch=develop)](https://travis-ci.org/reactgular/destroyable)
[![Coverage Status](https://coveralls.io/repos/github/reactgular/destroyable/badge.svg?branch=develop)](https://coveralls.io/github/reactgular/destroyable?branch=develop)
[![npm version](https://badge.fury.io/js/%40reactgular%2Fdestroyable.svg)](https://badge.fury.io/js/%40reactgular%2Fdestroyable)

## What is Destroyable?

Destroyable is an abstract class which implements the `OnDestroy` life-cycle hook in Angular, and when the hook gets triggered a protected observable 
named `_destroyed$` will emit once and then complete.

You can then use `takeUntil(this._destroyed$)` when subscribing to observables from inside your component, and the subscription will automatically
end when the component has been destroyed.

The usage of `takeUntil(this._destroyed$)` is a popular best practice for Angular projects. You can find a lot of tutorials online discussing the practice.

- [The Best Way To Unsubscribe RxJS Observables In The Angular Applications](https://blog.angularindepth.com/the-best-way-to-unsubscribe-rxjs-observable-in-the-angular-applications-d8f9aa42f6a0)
- [The easiest way to unsubscribe from Observables in Angular](https://medium.com/thecodecampus-knowledge/the-easiest-way-to-unsubscribe-from-observables-in-angular-5abde80a5ae3)

## Changelog

[Learn about the latest improvements][changelog].

## Installation

To get started, install the package from npm.

```bash
npm install --save @reactgular/destroyable
```

### Usage

Allows you to easily add `takeUntil(this._destroyed$)` to components, modules and services in an Angular application.

The following example component prints ascending numbers to the console for as long as the component lives.

```
import {Component, OnInit} from '@angular/core';
import {interval} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Destroyable} from '@reactgular/destroyable';

@Component({
    selector: 'example'
    template: ''
})
export class ExampleComponent extends Destroyable implements OnInit {
  public ngOnInit(): void {
    interval(1000).pipe(
      takeUntil(this._destroyed$)
    ).subscribe(value => console.log(value));
  }
}
```
