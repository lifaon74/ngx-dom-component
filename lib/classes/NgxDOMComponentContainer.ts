import { ViewContainerRef } from '@angular/core';
import { NgxDOMComponent, NgxDOMComponentOptions } from './NgxDOMComponent';

export class NgxDOMComponentContainer {

  public viewContainerRef: ViewContainerRef;

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef;
  }

  create(options: NgxDOMComponentOptions): NgxDOMComponent {
    options.viewContainerRef = this.viewContainerRef;

    return new NgxDOMComponent(options);
  }
}
